const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },
        slots: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TimeSlot",
            },
        ],
        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        generationDate: {
            type: Date,
            default: Date.now,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
