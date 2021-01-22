// *********************************** 
//            REQUIRE  
// ***********************************
const path = require('path')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review')
const express = require('express')

const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate)
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

// *********************************** 
// MONGO - connect to mongoose 
// ***********************************
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})
// *********************************************************
// VALIDATE MIDDLEWARE - If the campground req.body is valid 
// *********************************************************
//use app.use as middleware to access any request to any route, 
//use functions like validateCampground to access any request to a specific route
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
// ***************************************************** 
// VALIDATE MIDDLEWARE - If the review req.body is valid 
// *****************************************************
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
// ********************************** 
// INDEX - renders multiple campgrounds 
// **********************************
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))
// **********************************
// NEW - renders a form
// **********************************
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
// **********************************
// CREATE - creates a new campground
// **********************************
//When using PUT or POST, we need to make the form action the same as the url in the first parameter in the post/put method.
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))
// **********************************************
// SHOW - details about one particular campground
// **********************************************
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show',{campground})
}))
// *******************************************
// EDIT - renders a form to edit a campground
// *******************************************
app.get('/campgrounds/:id/edit', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))
// *******************************************
// UPDATE - updates a particular campground
// *******************************************
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))
// *******************************************
// DELETE/DESTROY- removes a single campground
// *******************************************
app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
}))
// *********************************** 
// CREATE - creates a new review 
// ***********************************
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
// *******************************************
// DELETE/DESTROY- removes a single review
// *******************************************
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

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

