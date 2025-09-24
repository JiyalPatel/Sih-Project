const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        sem: { type: Number, required: true },
        strength: { type: Number, required: true },

        // subjects linked to this batch
        subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],

        // Available Days
        avail_days: {
            type: [String],
            enum: ["mon", "tues", "wed", "thurs", "fri", "sat", "sun"],
            default: ["mon", "tues", "wed", "thurs", "fri", "sat"],
        },

        // Available Slots
        avail_slots: {
            type: [String],
            default: ["1", "2", "3", "4", "5", "6", "7", "8"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);
