const express = require("express");
const app = express();
const mongoose = require("mongoose");
const chef = require("./models/chef.js");
const admin = require("./models/admin.js")
// const confirmedChef = require("./models/Cchef.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const foodItems = require("./models/listing");
const chefInfo = require("./models/chef.js");
const {isLoggedIn, isOwner} = require("./middleware.js");
// const {listingSchema} = require("./schema.js");
const User = require("./models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("./middleware.js");
const session = require("express-session");
const localStrategy = require("passport-local");
const { log } = require("console");

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxage: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(admin.authenticate()));
passport.use(new localStrategy(User.authenticate()));


// passport.serializeUser(admin.serializeUser());
// passport.deserializeUser(admin.deserializeUser());  
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use((req, res, next) => {
    // res.locals.success = req.flash("success");
    // res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})





app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/HomelyBites";

main().then(()=> {
        console.log("connected to the DB")
    }).catch((err) => {
        console.log(err)
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}






app.get("/", (req, res) => {
    res.render("./Extra/home.ejs")
})

app.get("/chef", async (req, res) => {
    let allListings = await chef.find({approved: true});
    res.render("./listings/main.ejs", {allListings});
})

app.get("/chef/:id", async (req, res) => {
    let {id} = req.params;
    let allListings = await foodItems.find().populate("owner");
    // console.log(allListings);
    res.render("./listings/index.ejs", {allListings});
})

app.get("/listings/new", isLoggedIn, (req, res) => {
    res.render("./listings/new.ejs");
});

app.get("/listings/Chef", async (req, res) => {
    let allChefs = await chefInfo.find({approved: true});
    res.render("./Extra/chefListing.ejs", {allChefs});
});

app.get("/listings/Chef/:id", async (req, res) => {
    let {id} = req.params; 
    let Chef = await chefInfo.find({owner: id});
    res.render("Extra/showChef.ejs", {Chef});
})

app.post("/listings", isLoggedIn, async (req, res) => {
    //let {title, description, image, price, country, location} = req.body;
    let newListing = foodItems(req.body.foodItems);
    newListing.owner = req.user._id;
    await newListing.save();
    res.redirect("/chef");
});

app.get("/listings/:id/edit",isLoggedIn, isOwner, async(req, res) => {
    let {id} = req.params;
    let listing = await foodItems.findByIdAndUpdate(id, {...req.body.foodItems});
    res.render("listings/edit.ejs", {listing})
})

app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;
    await foodItems.findByIdAndUpdate(id, {...req.body.foodItems});
    res.redirect(`/listings/${id}`);
});

app.get("/listings/terms&conditions", (req, res) => {
    res.render("extra/terms&conditions.ejs");
})

app.get("/listings/newChef", async(req, res) => {
    res.render("listings/chef.ejs");
})

app.post("/listings/newchef", async (req, res) => {
    let newChef = chef(req.body.chef);
    await newChef.save();
    res.redirect("/");
})

app.delete("/listings/:id",isLoggedIn, isOwner, async (req, res)=> {
    let {id} = req.params;
    await foodItems.findByIdAndDelete(id);
    res.redirect("/");
})

//SHOW ROUTE
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    let Listing = await foodItems.findById(id).populate("owner");
    // console.log(Listing);
    
    res.render("listings/show.ejs", {Listing});
});

app.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
})

app.post("/signup", async (req, res) =>{
    try{
    let {username, email, password} = req.body;
    const newUser = new User({email, username})
    const registerUser = await User.register(newUser, password)
    console.log(registerUser);
    req.login(registerUser, (err) => {
        if(err) {
            return next(err);
        }
        // req.flash("success", "user was registered succesfully");
        res.redirect("/listings/newchef");
    })
    } catch(err){
        // req.flash("error", err.message);
        res.redirect("/signup")
    }  
});

app.get("/login", (req, res) => {
    res.render("users/login.ejs");
})

app.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect: '/login', failureFlash: false}), async (req, res) => {
    // req.flash("success", "welcome to wanderlust, you are logged in!")
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect("/chef");
})


app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        // req.flash("success", "you are logged out");
        res.redirect("/");
    });
});



app.get("/admin", async (req, res) => {
    let Chef = await chef.find({approved: false});
    res.render("admin/index.ejs", {Chef})
})

app.get("/admin/signup", (req,res) => {
    res.render("admin/signup.ejs")
})

app.post("/admin", async(req, res) => {
    try{
        let {username, email, password} = req.body;
        const newAdmin = new admin({email, username})
        const registerAdmin = await admin.register(newAdmin, password)
        console.log(registerAdmin);
        req.login(registerAdmin, (err) => {
            if(err) {
                return next(err);
            }
            // req.flash("success", "user was registered succesfully");
            res.redirect("/admin");
        })
        } catch(err){
            // req.flash("error", err.message);
            res.redirect("/")
        }  
})


app.get("/admin/login", (req,res) => {
    res.render("admin/login.ejs");
})

app.post("/admin/login", passport.authenticate("local", {failureRedirect: '/', failureFlash: false}), async (req, res) => {
    // req.flash("success", "welcome to wanderlust, you are logged in!")
    // let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect("/admin");
})

app.get("/admin/chef/:id", async (req, res) => {
    let {id} = req.params;
    let Chef = await chefInfo.findById(id);
    res.render("admin/approveChef.ejs", {Chef})
})

app.delete("/admin/:id/notApproveChef", async (req, res) => {
    let {id} = req.params;
    await chef.findByIdAndDelete(id);
    // await user.findByIdAndDelete(id);
    res.redirect("/");
})

app.post("/admin/:id/approveChef", async (req, res) => {
    let {id} = req.params;
    newChef = await chef.findByIdAndUpdate(id, {$set: {approved: true}});
    console.log(newChef);
    // newChef.approved = true;
    res.redirect("/admin");
})

app.listen("8080", () => {
    console.log(`listening at port 8080`);
});