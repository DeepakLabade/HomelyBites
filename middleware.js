const Listing = require("./models/listing");
const user = require("./models/user");
// const review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        // req.flash("error", "you must be logged in to create listing")
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    console.log(listing);
    if (!listing.owner.equals(res.locals.currUser._id)){
        // req.flash("error", "you don't have a permission to edit")
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let listing = await review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)){
        // req.flash("error", "you are not a author")
        return res.redirect(`/listings/${id}`);
    }
    next();
}