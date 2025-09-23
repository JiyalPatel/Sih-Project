const Faculty = require("../models/faculty.model");
const User = require("../models/user.models");


// Create Faculty with User account
const createFaculty = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            specialization,
            preferred_days,
            preferred_slots,
        } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ msg: "Email already exists" });

        

        // Create User with role "faculty"
        const user = await User.create({
            name,
            email,
            password,
            role: "faculty",
        });

        // Create Faculty linked to User
        const faculty = await Faculty.create({
            fac_acc: user._id,
            specialization: specialization || [],
            preferred_days: preferred_days || [],
            preferred_slots: preferred_slots || [],
        });

        res.status(201).json({
            msg: "Faculty and account created successfully",
            faculty,
            credentials: { email: user.email, password },
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Get all Faculty
const getFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find().populate(
            "fac_acc",
            "name email"
        );
        res.json(faculties);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Get single Faculty by ID
const getFacultyById = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id).populate(
            "fac_acc",
            "name email"
        );
        if (!faculty) return res.status(404).json({ msg: "Faculty not found" });
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Update Faculty and linked User
const updateFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id).populate(
            "fac_acc"
        );
        if (!faculty) return res.status(404).json({ msg: "Faculty not found" });

        const {
            name,
            email,
            password,
            specialization,
            preferred_days,
            preferred_slots,
        } = req.body;

        // Update linked User
        const user = await User.findById(faculty.fac_acc._id);
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password =password;

        await user.save();

        // Update Faculty details
        if (specialization) faculty.specialization = specialization;
        if (preferred_days) faculty.preferred_days = preferred_days;
        if (preferred_slots) faculty.preferred_slots = preferred_slots;

        await faculty.save();

        res.json({
            _id: faculty._id,
            fac_acc: { _id: user._id, name: user.name, email: user.email },
            specialization: faculty.specialization,
            preferred_days: faculty.preferred_days,
            preferred_slots: faculty.preferred_slots,
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Delete Faculty
const deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ msg: "Faculty not found" });

        await User.findByIdAndDelete(faculty.fac_acc);
        await faculty.deleteOne();

        res.json({ msg: "Faculty and linked user deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createFaculty,
    getFaculties,
    getFacultyById,
    updateFaculty,
    deleteFaculty,
};
