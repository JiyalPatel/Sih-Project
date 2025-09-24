const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        hod: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HOD",
            required: false,
        },
        institute: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute",
            required: true,
        },
        subjects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subject",
            },
        ],
        faculties: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Faculty",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
