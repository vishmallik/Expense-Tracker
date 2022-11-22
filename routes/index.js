const express = require("express");
const router = express.Router();
const passport = require("passport");

/* GET home page. */
router.get("/", function (req, res, next) {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("index", { error, success });
});

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/home");
  }
);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/home");
  }
);
module.exports = router;
