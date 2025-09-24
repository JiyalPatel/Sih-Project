const mongoose = require("mongoose");

const DAYS_ENUM = ["mon", "tue", "wed", "thu", "fri", "sat"];
const SLOTS_ENUM = ["1", "2", "3", "4", "5", "6", "7", "8"];

const roomSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        classNum: { type: String, required: true, unique: true }, // unique room number/code
        type: {
            type: String,
            enum: ["lab", "lecture"],
            required: true,
        },
        capacity: { type: Number, required: true },

        avail_days: {
            type: [String],
            enum: DAYS_ENUM,
            default: DAYS_ENUM, // default all days available
        },
        avail_slots: {
            type: [String],
            enum: SLOTS_ENUM,
            default: SLOTS_ENUM, // default all slots available
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
