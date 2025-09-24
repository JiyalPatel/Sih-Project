const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema(
    {
        fac_acc: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        upcoming_classes: [
            { type: mongoose.Schema.Types.ObjectId, ref: "TimeSlot" },
        ],
        specialization: [{ type: String }],
        subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
        max_hours_per_week: { type: Number, default: 20 },
        max_lab_hours_per_week: { type: Number, default: 8 },
        max_lec_hours_per_week: { type: Number, default: 12 },

        // Preferred Days (enum + default ALL days)
        preferred_days: {
            type: [String],
            enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            default: ["mon", "tue", "wed", "thu", "fri", "sat"],
        },

        // Preferred Slots (enum + default ALL slots)
        preferred_slots: {
            type: [String],
            enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
            default: ["1", "2", "3", "4", "5", "6", "7", "8"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Faculty", FacultySchema);
