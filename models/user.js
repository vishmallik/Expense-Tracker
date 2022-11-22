const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    name: String,
    gh_name: String,
    gg_name: String,
    email: { type: String, required: true, unique: true, match: /@/ },
    password: { type: String, minlength: 5 },
    age: { type: Number, default: 0 },
    phone: String,
    country: String,
    emailToken: String,
    isVerified: false,
    expenses: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
    incomes: [{ type: Schema.Types.ObjectId, ref: "Income" }],
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.password && this.isModified("password")) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;
      next();
    });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

module.exports = mongoose.model("User", userSchema);
