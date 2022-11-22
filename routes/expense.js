const express = require("express");
const Expense = require("../models/expense");
const router = express.Router();
const User = require("../models/user");

router.post("/add", function (req, res, next) {
  req.body.userId = req.user.id;
  req.body.category = req.body.category.toLowerCase();
  Expense.create(req.body, (err, expense) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      req.user.id,
      { $push: { expenses: expense.id } },
      (err, user) => {
        if (err) return next(err);
        req.flash("successE", "Expense added Successfully");
        res.redirect("/home");
      }
    );
  });
});

module.exports = router;
