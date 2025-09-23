const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    institute_acc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    integrationLink: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const Institute = mongoose.model("Institute", instituteSchema);
module.exports = Institute;
