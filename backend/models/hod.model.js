const mongoose = require("mongoose");

const hodSchema = new mongoose.Schema(
    {
        hod_acc: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("HOD", hodSchema);