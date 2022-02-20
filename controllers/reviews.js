const Campground = require('../models/campground');
const Review = require('../models/review');
const sendEmail = require('../utils/send_email');

// creating review
module.exports.createReview = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    await sendEmail(undefined,undefined,`New Yelp Review - ${review._id}`, "emails/newReview.ejs", {campground})
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// deleting review
module.exports.deleteReview = async (req, res, next) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}
