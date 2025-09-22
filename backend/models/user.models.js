const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["admin", "institute-admin", "hod", "dept-admin", "faculty"];

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ROLES,
            default: "faculty",
        },
    },
    { timestamps: true }
);

// hash password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
