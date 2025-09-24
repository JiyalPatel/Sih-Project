const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        day: {
            type: String,
            enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            required: true,
        },
        slot: {
            type: String,
            enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TimeSlot", timeSlotSchema);
