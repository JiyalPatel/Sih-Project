const mongoose = require("mongoose");

const deptAdminSchema = new mongoose.Schema(
    {
        dept_admin_acc: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("DeptAdmin", deptAdminSchema);