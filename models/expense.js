const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const expenseSchema = new Schema(
  {
    category: String,
    amount: { type: Number, default: 0 },
    date: Date,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
