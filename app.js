const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const auth = require("./middlewares/auth");

require("dotenv").config();
require("./modules/passport");

const uri = process.env.MONGO_URL;

mongoose.connect(uri, (err) => {
  console.log(err ? err : "Connected to DB");
});

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const homeRouter = require("./routes/home");
const expenseRouter = require("./routes/expense");
const incomeRouter = require("./routes/income");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(auth.userData);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use(auth.isLoggedIn);
app.use("/home", homeRouter);
app.use("/income", incomeRouter);
app.use("/expense", expenseRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
