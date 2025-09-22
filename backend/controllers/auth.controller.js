const {
    generateToken,
    registerUser,
    loginUser,
} = require("../services/auth.js");

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await registerUser({ name, email, password, role });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user),
        });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser({ email, password });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user),
        });
    } catch (err) {
        res.status(401).json({ msg: err.message });
    }
};

module.exports = {
    register,
    login,
};
