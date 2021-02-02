const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

//set each image to a width of 200 px by changing the API link from coudinary
//.virtual means we can do image.thumbnail
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

//middleware to delete all reviews when a campground is deleted
//doc is the campground that just got deleted
//if a post request is sent with 'findOneAndDelete', then this function will run
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema)