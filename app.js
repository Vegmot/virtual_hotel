//jshint esversion: 6

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const findOrCreate = require("mongoose-findorcreate");
const _ = require("lodash");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "Virtual Hotel Users",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const admin = process.env.ADMIN_ID;
const adminPass = process.env.ADMIN_PASS;

mongoose.connect(
  "mongodb+srv://admin-" +
    admin +
    ":" +
    adminPass +
    "@cluster0-jlcms.mongodb.net/hotelDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
    unique: true,
  },
  lastName: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  signupDate: String,
  ipAddress: String,
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/************************************ get methods **********************************************/
/************************************ get methods **********************************************/
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/cta", (req, res) => {
  res.render("cta");
});

app.get("/downloadApp", (req, res) => {
  res.render("downloadApp");
});

app.get("/features", (req, res) => {
  res.render("features");
});

app.get("/photos", (req, res) => {
  res.render("photos");
});

app.get("/photos2", (req, res) => {
  res.render("photos2");
});

app.get("/photos3", (req, res) => {
  res.render("photos3");
});

app.get("/pricing", (req, res) => {
  res.render("pricing");
});

app.get("/myinfo", (req, res) => {
  // if not logged in, redirect to login page
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  } else {

    console.log(req.user.id);

    // show all the users database
    User.findById(req.user.id, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          console.log(foundUser);
          res.render("myinfo", {
            foundUser: foundUser,
          });
        }
      }
    });
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    signupErrorMsg: "",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    loginErrorMessage: "",
  });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

/************************************ get methods **********************************************/
/************************************ get methods **********************************************/

/************************************ post methods **********************************************/
/************************************ post methods **********************************************/
/* register */
app.post("/signup", (req, res) => {
  // if any one of the field is left blank
  if (
    !req.body.username ||
    !req.body.signupFirstName ||
    !req.body.signupLastName ||
    !req.body.password ||
    !req.body.signupConfirmPassword
  ) {
    res.render("signup", {
      signupErrorMsg: "Please fill all the fields",
    });
  } else {

    // to get full "xxxday" format
    const options = {weekday: "long"};
    const suDay = new Intl.DateTimeFormat('en-US', options).format(new Date());
    
    const suMonth = new Date().getMonth();
    const suDate = new Date().getDate();
    const suYear = new Date().getFullYear();
    const suHour = new Date().getHours();
    const suMinute = new Date().getMinutes();
    
    const signupDate = suMonth + "/" + suDate + "/" + suYear + ", " + suDay + ", " + suHour + ":" + suMinute;

    // when both the passwords entered match
    if (req.body.password === req.body.signupConfirmPassword) {
      // why does it print ::1?
      let ipAddress =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

        /*
        const user = new User({
        username: req.body.username,
        firstName: _.upperFirst([_.toLower([req.body.signupFirstName])]),
        lastName: _.upperFirst([_.toLower([req.body.signupLastName])]),
        password: req.body.password,
        signupDate: signupDate,
        ipAddress: ipAddress,
        });
        */


      // ...register the user
      User.register(
        {
          username: req.body.username,
          firstName: _.upperFirst([_.toLower([req.body.signupFirstName])]),
          lastName: _.upperFirst([_.toLower([req.body.signupLastName])]),
          signupDate: signupDate,
          ipAddress: ipAddress,
        },
        req.body.password,
        (err, user) => {
          if (err) {
            console.log(err);
            res.render("signup", {
              signupErrorMsg: "An error occurred. Please try again",
            });
          } else {
            passport.authenticate("local")(req, res, () => {
              console.log(user);
              res.redirect("/myinfo");
            });
          }
        }
      );

      // entered passwords do not match
    } else {
      res.render("signup", {
        signupErrorMsg: "Entered passwords don't match",
      });
    }
  }
});

/* login */
//
app.post("/login", (req, res) => {
  // user didn't enter email
  if (!req.body.username || !req.body.password) {
    res.render("login", {
      loginErrorMessage: "Please fill all the fields",
    });

    // user didn't enter password
  } else {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/myinfo");
    });
  }
});

/************************************ post methods **********************************************/
/************************************ post methods **********************************************/

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Local server is running...");
});
