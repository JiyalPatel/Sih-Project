const User = require("../models/user.models.js");
const Institute = require("../models/institute.model.js");
const bcrypt = require("bcryptjs");

// Create Institute (with User together)
const createInstitute = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        // // Hash password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create User with role = institute-admin
        const user = await User.create({
            name,
            email,
            password,
            role: "institute",
        });

        // Create Institute linked to that user
        const institute = await Institute.create({
            name,
            institute_acc: user._id,
            integrationLink: `/institutes/${user._id}`, // or slug-based if needed
        });

        return res.status(201).json({
            msg: "Institute and account created successfully",
            institute,
            credentials: {
                email: user.email,
                password, // send plain password only here once
            },
        });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

// Get all institutes
const getInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.find().populate(
            "institute_acc",
            "name email"
        );
        res.json(institutes);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Get single institute by id
const getInstituteById = async (req, res) => {
    try {
        const institute = await Institute.findById(req.params.id).populate(
            "institute_acc",
            "name email"
        );
        if (!institute)
            return res.status(404).json({ msg: "Institute not found" });
        res.json(institute);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// UPDATE Institute and linked User
const updateInstitute = async (req, res) => {
    try {
        const institute = await Institute.findById(req.params.id).populate(
            "institute_acc"
        );
        if (!institute)
            return res.status(404).json({ msg: "Institute not found" });

        const { name, email, password } = req.body;

        // Update Institute name if provided
        if (name) institute.name = name;

        // Update linked User account
        const user = await User.findById(institute.institute_acc._id);
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10); // hash password

        await user.save();
        await institute.save();

        res.json({
            _id: institute._id,
            name: institute.name,
            institute_acc: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            integrationLink: institute.integrationLink,
        });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

// Delete institute
const deleteInstitute = async (req, res) => {
    try {
        const institute = await Institute.findById(req.params.id);
        if (!institute)
            return res.status(404).json({ msg: "Institute not found" });

        // also delete linked user
        await User.findByIdAndDelete(institute.institute_acc);
        await institute.deleteOne();

        res.json({ msg: "Institute and linked user deleted" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createInstitute,
    getInstitutes,
    getInstituteById,
    updateInstitute,
    deleteInstitute,
};
