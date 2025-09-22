const jwt = require("jsonwebtoken");
const User = require("../models/user.models.js");

const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ msg: "Not authorized, no token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (err) {
        res.status(401).json({ msg: "Not authorized, token failed" });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Access denied" });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
