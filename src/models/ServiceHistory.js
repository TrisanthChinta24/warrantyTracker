const mongoose = require("mongoose");

const serviceHistorySchema = new mongoose.Schema(
  {
    warranty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warranty",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    documents: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceHistory", serviceHistorySchema);
