const Listing= require("./models/listingSchema.js");
const Review = require("./models/reviewSchema.js");



module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to edit/delete a listing");
        return res.redirect("/login");
    }
    next();
};



module.exports.isOwner=async(req,res,next)=>{
    let {id}= req.params;
    let listing= await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error","You're not the owner of the listing");
            return res.redirect(`/listings/${id}`);
        }
        next();
};

module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id, reviewId}= req.params;
    let review= await Review.findById(reviewId);
        if(!review.author._id.equals(res.locals.currUser._id)){
            req.flash("error","You did not create this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
}