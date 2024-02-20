// app.js
// if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
// }

// 1) npm init -y

// 2) npm i express
    const express= require('express');
    const app= express();

// 3) npm i ejs
    const path=require('path');
    // create a folder 'views'
    app.set('view engine','ejs');
    app.set('views', path.join(__dirname, "/views"));
    // As I'll be using POST requests, for parsing the data should include
    app.use(express.urlencoded({extended:true}));
    app.set("views",path.join(__dirname,"/views"));
    app.use(express.static(path.join(__dirname,"public")));

// 4) npm i mongoose
// **  start mongosh in terminal **
// **  After connecting to DB, go create Schema in 'models' **
    const mongoose= require('mongoose');
    const dbUrl= process.env.ATLASDB_URL;
    main().then(()=>console.log('Connected to DB'))
          .catch((err)=>console.log(err));
    async function main() {
        await mongoose.connect(dbUrl);
        };


// 5) npm i method-override
        const methodOverride=require('method-override');
        app.use(methodOverride('_method'));

// 6) npm i ejs-mate
        const ejsMate=require("ejs-mate");
        app.engine('ejs',ejsMate);


// 7) Requiring wrapAsync to make try & catch block easier
        const wrapAsync=require('./utils/wrapAsync.js');
        // but I'm not using this in CREATE ROUTE because, i feel try&catch block easy 

// 8) Requiring ExpressError
        const ExpressError=require("./utils/ExpressError.js");

// 9) Requiring Joi for Server Schema Validation
        const {listingSchema, reviewSchema}=require("./public/js/Joi.js");
        const validateReview= (req,res,next)=>{
            let {error}= reviewSchema.validate(req.body);
            if(error){
                let errMsg= error.details.map((el)=>el.message).join(",");
                throw new ExpressError(400, errMsg);
            } else{
                next();
            };
        };

// 10) Requiring Reviews from reviewSchema.js
        const Review = require("./models/reviewSchema.js");

// 11) npm i cookie-parser
        const cookieParser=require("cookie-parser");
        app.use(cookieParser());

// 12) npm i express-session
        const session=require("express-session");
        // 22) npm i connect-mongo
        const MongoStore = require('connect-mongo');

        const store= MongoStore.create({
            mongoUrl: dbUrl,
            crypto:{
                secret:process.env.SECRET,
            },
            touchAfter:24*3600,
        });

        store.on("error",()=>{
            console.log("ERROR in MONGO SESSION STORE",err);
        });

        const sessionOptions={
            store: store,
            secret: process.env.SECRET,
            resave:false,
            saveUninitialized:true,
            cookie:{
                expires: Date.now()+7*24*60*60*1000,
                maxAge:7*24*60*60*1000,
                httpOnly:true,
            },
        };

        app.use(session(sessionOptions));


       


// 13) npm i connect-flash
        const flash=require("connect-flash");
        app.use(flash());


// 14) npm i passport
        const passport=require("passport");
    
// 15) npm i passport-local
        const LocalStrategy= require("passport-local");

// 16) npm i passport-loacal-mongoose -> in models/user.js

        const User= require("./models/user.js");
        app.use(passport.initialize());
        app.use(passport.session());
        passport.use(new LocalStrategy(User.authenticate()));
        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());


// 17) requiring isLoggedIn middleware 
        const {isLoggedIn, isOwner, isReviewAuthor}= require("./middleware.js");

// 18) npm i multer
        const multer= require('multer');
        const{storage}=require("./cloudConfig.js");
        const upload= multer({storage});

// 19) npm i dotenv

        
        
        // console.log(process.env.secret);

// 20) npm i cloudinary multer-storage-cloudinaty


// 21) npm i @mapbox/mapbox-sdk
        const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
        const mapToken= process.env.MAP_TOKEN;
        const geocodingClient = mbxGeocoding({ accessToken: mapToken });



// checking if serveris working
    // app.get('/',(req,res)=>{
    //     res.send("Server connection established");
    // });


// **-> I've commented the below '/testListing' path after creating init folder. Cuz now we have all data in the collection/model

// // after creating the model, require it here and create a document to check in mongosh
    const Listing=require("./models/listingSchema.js");
const { send } = require('process');
const { error } = require('console');
//     app.get('/testListing',async(req,res)=>{
//         let sampleListing= new Listing({
//             title: "My new Villa",
//             description: "By the Beach",
//             price: 500,
//             location: " Houston, Texas",
//             country: "USA",
//         });
//         // Now you have to save this to see change in the DB
//         await sampleListing.save();// generally you use then() and catch() block after save(). If you're not using 
//                                      them, use "await" & "async" keywords
//         console.log("Sample was Saved");
//         res.send("Sucessfull tesing");
//     });
// **->


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser= req.user;
    next();
});

// ALL LISTINGS
    app.get("/listings",wrapAsync(async(req,res)=>{
        // Listing.find().then((res)=>console.log(res));
        const allListings=await Listing.find();
        res.render("listings/index.ejs",{allListings});
        

    }));
    // app.post("/listings",upload.single('listing[image]'),(req,res)=>{
    //     let url = req.file.path;
    //     let filename= req.file.filename;
    //     console.log({url, filename});
    //     res.send(req.file);
        
        

    // });



// NEW ROUTE
    app.get("/listings/new",isLoggedIn,(req,res)=>{
        
        res.render('listings/new.ejs');
    });

    app.get("/listings/q",wrapAsync(async(req,res)=>{
        let {category}= req.query;
        const allListings=await Listing.find();
        res.render('listings/filter.ejs',{category,allListings});
    }));

    app.post("/listings/q",wrapAsync(async(req,res)=>{
        let {category}= req.query;
        const allListings=await Listing.find();
        res.render('listings/filter.ejs',{category,allListings});
    }))

// SHOW ROUTE
    app.get("/listings/:id",wrapAsync(async(req,res)=>{
        let {id}= req.params;
        let list=await Listing.findById(id).
        populate({
            path:"reviews",
            populate:{
            path:"author"
            },
        })
        .populate("owner");
        if(!list){
            req.flash("error", "Listing you requested does not exit!");
            res.redirect("/listings")
        }
        // console.log(list);
        // console.log(list.geometry.coordinates);
        let coordinate= list.geometry.coordinates;
        
        res.render('listings/show.ejs',{list,coordinate});
    }));

    

// CREATE ROUTE
    app.post("/listings",isLoggedIn,upload.single('listing[image]'),async(req,res,next)=>{
        try {
            let response =await geocodingClient.forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
              }).send();
            
                
            let url = req.file.path;
            let filename= req.file.filename;
            // console.log(url,'..', filename);
            let result=listingSchema.validate(req.body);
            // console.log(result);
            const newList=new Listing(req.body.listing);
            newList.owner=req.user._id;
            newList.image= {url, filename};
            newList.geometry= response.body.features[0].geometry;

            let savedList=await newList.save();

            console.log(savedList);
            req.flash("success","New Listing Created");
            res.redirect('/listings');
        } catch (err) {
            next(err);// -> this will redirect to MIDDLEWARE block
            // We do this cuz if theres a error, the user should not know where and in which file the error is 
        }
        
    });


// EDIT ROUTE
    app.get('/listings/:id/edit',isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
        let {id}= req.params;
        let editList= await Listing.findById(id);
        if(!editList){
            req.flash("error", "Listing you requested does not exit!");
            res.redirect("/listings")
        }
        let originalImage=editList.image.url;
        originalImage=originalImage.replace("/upload","/upload/h_300,w_250");
        res.render('listings/edit.ejs',{editList,originalImage});
    }));


// UPDATE ROUTE
    app.put("/listings/:id",isLoggedIn,isOwner,upload.single('listing[image]'),wrapAsync(async(req,res)=>{
        let {id}= req.params;
        // let listing= await Listing.findById(id);
        // if(!listing.owner._id.equals(res.locals.currUser._id)){
        //     req.flash("error","You don't have permission to edit");
        //     return res.redirect(`/listings/${id}`);
        // }
        let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
        if(typeof req.file!="undefined"){
            let url = req.file.path;
            let filename= req.file.filename;

            listing.image={url, filename};
            await listing.save();
        }

        req.flash("success","Listing Updated");
        res.redirect(`/listings/${id}`);
    }));


// DELETE ROUTE
    app.delete("/listings/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
        let {id}=req.params;
        let deletedList=await Listing.findByIdAndDelete(id);
        console.log(deletedList);
        req.flash("success","Listing Deleted");
        res.redirect("/listings");
    }));


// REVIEWS
    // Post Review Route
    app.post("/listings/:id/reviews",isLoggedIn,validateReview,wrapAsync(async(req,res)=>{
        let listing= await Listing.findById(req.params.id);
        let newReview= new Review(req.body.review);
        newReview.author=req.user._id;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
        req.flash("success","New Review created!");

        res.redirect(`/listings/${listing._id}`);
    }));


    // Delete Review Route
    app.delete("/listings/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async(req,res)=>{
        let {id, reviewId}=req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","Review Deleted");

        res.redirect(`/listings/${id}`);
    }));


// User
    // SignUp Page GET req
    app.get("/signup",(req,res)=>{
        
        res.render('users/signup.ejs');
        
    });

    // SignUp Page POST req
    app.post('/signup',wrapAsync(async(req,res)=>{
        try {
            let {username, email, password}= req.body;
            const newUser= new User({email,username});
            const registeredUser=await User.register(newUser,password);
            console.log(registeredUser);
            req.login(registeredUser,(err)=>{
                if(err){
                    return next(err);
                }
                req.flash("success","Welcome to Airbnb!");
                res.redirect("/listings");
            })
            
        } catch (error) {
            req.flash("error",error.message);
            res.redirect("/signup");
        }
        
    }));

    // Login Page GET req
    app.get("/login",(req,res)=>{
        res.render('users/login.ejs');
    });

    // Login Page POST req
        // passport.authenticate is a middleware provided by passport
    app.post('/login',  
                passport.authenticate('local', { 
                    failureRedirect: '/login',
                    failureFlash: true 
                    }),
                async(req,res)=>{
                    req.flash("success","Welcome to Airbnb!");
                    res.redirect("/listings");

    });


    // Logout Page GET req
    app.get("/logout",(req,res,next)=>{
        req.logout((err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "you are logged out!");
            res.redirect("/listings");
        })
    });

    
    


// IF USER SENDS REQUEST TO A NEW PATH
    // e.g. if request is sent to localhost:8080/terms
    app.all('*',(req,res,next)=>{
        next(new ExpressError(404,"The Page you've requested is not found"));
    });


// MIDDLEWARE
    app.use((err,req,res,next)=>{
        let {status=500,message="Something went wrong"}=err;
        res.status(status).render("listings/error.ejs",{err});
        // res.status(status).send(message);
    });






// creating a port
    app.listen(8080,()=>{
        console.log("server is listening to port 8080");
    });