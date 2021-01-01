const path = require('path')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate)
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

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

// **********************************
// INDEX - renders multiple campgrounds
// **********************************
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
})
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
app.post('/campgrounds', async(req, res) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
})
// *******************************************
// SHOW - details about one particular campground
// *******************************************
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show',{campground})
})
// *******************************************
// EDIT - renders a form to edit a campground
// *******************************************
app.get('/campgrounds/:id/edit', async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
})
// *******************************************
// UPDATE - updates a particular campground
// *******************************************
app.put('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
})
// *******************************************
// DELETE/DESTROY- removes a single campground
// *******************************************
app.delete('/campgrounds/:id', async(req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})
