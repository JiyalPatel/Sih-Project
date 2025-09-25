// models/room.model.js
const mongoose = require("mongoose");

const DAYS_ENUM = ["mon", "tue", "wed", "thu", "fri", "sat"];
const SLOTS_ENUM = ["1", "2", "3", "4", "5", "6", "7", "8"];

const roomSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        classNum: { type: String, required: true, unique: true },
        type: {
            type: String,
            enum: ["lab", "lecture"],
            required: true,
        },
        capacity: { type: Number, required: true },

        // 🔵 New field
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },

        avail_days: {
            type: [String],
            enum: DAYS_ENUM,
            default: DAYS_ENUM,
        },
        avail_slots: {
            type: [String],
            enum: SLOTS_ENUM,
            default: SLOTS_ENUM,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
