const express = require("express");
const Income = require("../models/income");
const User = require("../models/user");
const router = express.Router();

router.post("/add", function (req, res, next) {
  req.body.userId = req.user.id;
  req.body.source = req.body.source.toLowerCase();
  Income.create(req.body, (err, income) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      req.user.id,
      { $push: { incomes: income.id } },
      (err, user) => {
        if (err) return next(err);
        req.flash("successI", "Income added Successfully");
        res.redirect("/home");
      }
    );
  });
});

module.exports = router;
