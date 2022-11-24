const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/register", (req, res, next) => {
  let { email, password } = req.body;
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
router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/");
});

module.exports = router;
