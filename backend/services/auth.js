const jwt = require("jsonwebtoken");
const User = require("../models/user.models.js");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" } // session lasts 30 days
    );
};

const registerUser = async ({ name, email, password, role }) => {
    const userExists = await User.findOne({ email });
    if (userExists) throw new Error("User already exists");

    const user = await User.create({ name, email, password, role });
    return user;
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        return user;
    } else {
        throw new Error("Invalid email or password");
    }
};



module.exports = {
    generateToken,
    registerUser,
    loginUser,
};
