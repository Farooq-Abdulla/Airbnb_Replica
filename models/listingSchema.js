// listing.js - models

// requiring mongoose, so that you can use mongoose.Schema and mongoose.model
   const mongoose= require('mongoose');

// Requiring Reviews from reviewSchema.js
   const Review = require("./reviewSchema.js");

// creating a Schema
   const listingSchema= new mongoose.Schema({
    title: {
        type:String,
        required: true,
    },
    description :{
        type: String,
    },
    image: {
      url:String,
      filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews:[{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Review",
    }],
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
    },
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
      //   required: true
      },
      coordinates: {
        type: [Number],
      //   required: true
      }
    },
    category:{
      type:String,
      enum:["Mountains",'City','Farms','Castles','Camping','Beaches','Arctic']
    },
   });


   listingSchema.post("findOneAndDelete", async(listing)=>{
      if(listing){
         await Review.deleteMany({_id : {$in: listing.reviews}});
      };
   });

// create a model (~collection)
   const Listing= mongoose.model("Listing", listingSchema);

// export this model, so that you can start adding data into DB in app.js
   module.exports= Listing;

  