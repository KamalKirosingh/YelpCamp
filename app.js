if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// *********************************** 
//            REQUIRE  
// ***********************************
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError');
const express = require('express')
const app = express()
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

// ***************************
// Render forms in directories 
// ***************************
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
//to allow layouts
app.engine('ejs', ejsMate)
//to parse req.body
app.use(express.urlencoded({extended: true}))
//the method name to override POST with DELETE
app.use(methodOverride('_method'))

// *********************************** 
// MONGO - connect to mongoose 
// ***********************************
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

// *********************************** 
//       SESSION/COOKIE SETUP  
// ***********************************
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
// **********************************
//      PASSPORT MIDDLEWARE 
// **********************************
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ***************************************************************
// FLASH MIDDLEWARE - success and error are automatically rendered
// ***************************************************************
app.use(flash());
app.use((req, res, next) => {
    console.log(req.session)
    //req.user returns if the user is signed in
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// **********************************
// ROUTER MIDDLEWARE - use the routes
// **********************************
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)

// **********************************
// HOME - renders home form
// **********************************
app.get('/', (req, res) => {
    res.render('home')
});
//If a get/post/put/delete request is sent and the req.params isn't identified
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})
// *********************************** 
// ERROR - handles all errors 
// ***********************************
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

