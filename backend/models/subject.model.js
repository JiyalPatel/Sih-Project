const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        subjectCode: { type: String, required: true, unique: true },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        semester: { type: Number, required: true },
        isLab: { type: Boolean, default: false },
        credits: { type: Number, required: true },

        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
        },

        labBlockSize: {
            type: Number,
            default: function () {
                return this.isLab ? 2 : null;
            },
        },

        duration_slots: {
            type: Number,
            default: function () {
                return this.isLab ? null : 1;
            },
        },

        hours_per_week: { type: Number, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subject", SubjectSchema);