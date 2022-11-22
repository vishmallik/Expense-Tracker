const express = require("express");
const router = express.Router();
const User = require("../models/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAUTH2",
    user: process.env.ID,
    clientId: process.env.CLIENT_ID_GOOGLE,
    clientSecret: process.env.CLIENT_SECRET_GOOGLE,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
router.get("/verify-email", (req, res, next) => {
  let token = req.query.token;
  User.findOne({ emailToken: token }, (err, user) => {
    if (err) {
      console.log("email not verified");
      return res.redirect("/");
    }
    User.findByIdAndUpdate(
      user.id,
      { emailToken: null, isVerified: true },
      (err, user) => {
        if (err) {
          return next(err);
        }
        return res.redirect("/login");
      }
    );
  });
});
router.post("/register", (req, res, next) => {
  let { email, password, name } = req.body;
  req.body.emailToken = crypto.randomBytes(64).toString("hex");
  if (!email && !password) {
    req.flash("error", "Email/password is required");
    return res.redirect("/");
  }
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.code === 11000) {
        req.flash("error", "Email is already registered");
        return res.redirect("/");
      }
      if (err.name == "ValidationError") {
        req.flash("error", "Password should be more than 5 characters long");
        return res.redirect("/");
      }
      return next(err);
    }
    const mailOptions = {
      from: '"Verify Your Email" <vishmallik@gmail.com> ',
      to: user.email,
      subject: "Trakr - Verify Your Email",
      html: `<h2>${user.name}! Thanks for registering on Trakr!!!</h2>
              <h4>Please verify your email to continue...</h4>
              <a href="http://${req.headers.host}/users/verify-email?token=${user.emailToken}">Verify Your Email</a>`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("verification mail is sent");
      }
    });
    req.flash("success", "User registered successfully");
    return res.redirect("/login");
  });
});

router.get("/login", (req, res, next) => {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("login", { error, success });
});

router.post("/login", (req, res, next) => {
  let { email, password } = req.body;
  if (!email && !password) {
    req.flash("error", "Email/password is required");
    return res.redirect("/login");
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "Email not found");
      return res.redirect("/login");
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash("error", "Password doesn't match");
        return res.redirect("/login");
      }
      req.session.userId = user.id;
      return res.redirect("/home");
    });
  });
});

router.get("/password-reset", (req, res, next) => {
  //to be added with nodemailer
});
router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/");
});

module.exports = router;
