// index.js -init

// we will insert the new data which we got from data.js here

// For that I'll need Data, Schema and model -> both of them I'll get from listingSchema
    const Listing= require('../models/listingSchema.js');


    const initData= require('./data.js');



    const mongoose= require('mongoose');
    const dbUrl= process.env.ATLASDB_URL;
    main().then(()=>console.log('Connected to DB'))
          .catch((err)=>console.log(err));
    async function main() {
        await mongoose.connect(dbUrl);
        };


    // Listing.deleteMany({}).then(()=>console.log("Deleted everything"))
    //                   .catch((err)=>console.log(err));
    // Listing.insertMany(initData.data).then(()=>console.log("inserted Data"))
    //                     .catch((err)=>console.log(err));
    // data which we get from data.js is an object and 'data is a key' , 'sampleListing is value'.
    // To access that we need 'initData.data'

// If you don't want to use this then and catch -->

    const initDB= async()=>{
        await Listing.deleteMany({});
        initData.data=initData.data.map((obj)=>({...obj,owner:"65c58dc4d04229ceb8d876fc"}));
        await Listing.insertMany(initData.data);
        console.log("Data was initialized");
    };
    initDB();





