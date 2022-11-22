const express = require("express");
const Income = require("../models/income");
const Expense = require("../models/expense");
const router = express.Router();
const mongoose = require("mongoose");
let monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

router.get("/", function (req, res, next) {
  let successE = req.flash("successE");
  let successI = req.flash("successI");
  console.log(successE, successI);
  res.render("home", { successI, successE });
});

router.get("/dashboard", (req, res, next) => {
  console.log(req.user.id);
  let month = Number(new Date().getMonth()) + 1;
  let currentMonth = monthNames[month - 1];

  Income.aggregate([
    { $addFields: { month: { $month: "$date" } } },
    {
      $match: {
        $expr: {
          $eq: ["$month", month],
        },
        userId: mongoose.Types.ObjectId(`${req.user.id}`),
      },
    },
  ]).exec((err, incomes) => {
    if (err) return next(err);
    console.log(incomes);
    Expense.aggregate([
      { $addFields: { month: { $month: "$date" } } },
      {
        $match: {
          $expr: {
            $eq: ["$month", month],
          },
          userId: mongoose.Types.ObjectId(`${req.user.id}`),
        },
      },
    ]).exec((err, expenses) => {
      if (err) return next(err);
      res.render("dashboard", {
        incomes,
        expenses,
        currentMonth,
      });
    });
  });
});

router.post("/bydate", (req, res, next) => {
  let dateFrom = req.body.from;
  let dateTo = req.body.to;
  Income.find(
    { date: { $lte: dateTo, $gte: dateFrom }, userId: req.user.id },
    (err, incomes) => {
      if (err) return next(err);
      Expense.find(
        { date: { $lte: dateTo, $gte: dateFrom }, userId: req.user.id },
        (err, expenses) => {
          if (err) return next(err);
          res.render("list", {
            incomes,
            expenses,
            dateFrom,
            dateTo,
            category: null,
            currentMonth: null,
          });
        }
      );
    }
  );
});

router.post("/bydateandcategory", (req, res, next) => {
  let dateFrom = req.body.from;
  let dateTo = req.body.to;
  let category = req.body.category.toLowerCase();
  Income.find(
    {
      date: { $lte: dateTo, $gte: dateFrom },
      source: category,
      userId: req.user.id,
    },
    (err, incomes) => {
      if (err) return next(err);
      Expense.find(
        {
          date: { $lte: dateTo, $gte: dateFrom },
          category: category,
          userId: req.user.id,
        },
        (err, expenses) => {
          if (err) return next(err);
          res.render("list", {
            incomes,
            expenses,
            dateFrom,
            dateTo,
            category,
            currentMonth: null,
          });
        }
      );
    }
  );
});
router.post("/bycategory", (req, res, next) => {
  let category = req.body.category.toLowerCase();
  Income.find({ source: category, userId: req.user.id }, (err, incomes) => {
    console.log(incomes, category);
    if (err) return next(err);
    Expense.find(
      { category: category, userId: req.user.id },
      (err, expenses) => {
        if (err) return next(err);
        res.render("list", {
          incomes,
          expenses,
          category,
          dateFrom: null,
          dateTo: null,
          currentMonth: null,
        });
      }
    );
  });
});

router.post("/bymonth", (req, res, next) => {
  let month = Number(req.body.month.slice(5, 7));
  let currentMonth = monthNames[month - 1];
  Income.aggregate([
    { $addFields: { month: { $month: "$date" } } },
    {
      $match: {
        $expr: {
          $eq: ["$month", month],
        },
        userId: mongoose.Types.ObjectId(`${req.user.id}`),
      },
    },
  ]).exec((err, incomes) => {
    if (err) return next(err);
    Expense.aggregate([
      { $addFields: { month: { $month: "$date" } } },
      {
        $match: {
          $expr: {
            $eq: ["$month", month],
          },
          userId: mongoose.Types.ObjectId(`${req.user.id}`),
        },
      },
    ]).exec((err, expenses) => {
      if (err) return next(err);
      res.render("list", {
        incomes,
        expenses,
        currentMonth,
        dateTo: null,
        dateFrom: null,
        category: null,
      });
    });
  });
});

module.exports = router;
