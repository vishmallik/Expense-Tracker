const User = require("../models/user");

module.exports = {
  isLoggedIn: (req, res, next) => {
    if (
      req.session &&
      (req.session.userId ||
        (req.session.passport && req.session.passport.user))
    ) {
      next();
    } else {
      res.redirect("/users/login");
    }
  },
  userData: (req, res, next) => {
    let userId =
      req.session &&
      (req.session.userId ||
        (req.session.passport && req.session.passport.user));
    if (userId) {
      User.findById(userId, "gh_name gg_name name email", (err, user) => {
        if (err) return next(err);
        req.user = user;
        res.locals.user = user;
        return next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      return next();
    }
  },
};
