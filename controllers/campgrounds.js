const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
const sendEmail = require('../utils/send_email');

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({}).sort({'date': -1}).limit(10).populate('popupText').populate({
        path: 'reviews',
        populate: {
            path: 'author',
        },
        perDocumentLimit: 3
    });
    res.render('campgrounds/index', {campgrounds})
}

// form to create new campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

// create new campground to db
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    await sendEmail(undefined,undefined,`New Yelp Campground - ${campground._id}`, "emails/newCampground.ejs", {campground})
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

// generate page to show campground to user
module.exports.showCampground = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
        },
        perDocumentLimit: 3
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

// show edit form for campground
module.exports.renderEditForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

// update campground and pics
module.exports.updateCampground = async (req, res, next) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: { images: { filename: { $in: req.body.deleteImages} } } })
    }
    await sendEmail(undefined,undefined,`Edited Yelp Campground - ${campground._id}`, "emails/newCampground.ejs", {campground})
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

// delete campground
module.exports.deleteCampground = async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}