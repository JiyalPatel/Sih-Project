const HOD = require("../models/hod.model");
const User = require("../models/user.models");
const Department = require("../models/department.model");

// Create an HOD account (for use by an 'institute' user)
const createHOD = async (req, res) => {
    try {
        const { name, email, password, departmentId } = req.body;

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ msg: "Department not found" });
        }
        if (department.hod) {
            return res
                .status(400)
                .json({ msg: "This department already has an HOD" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        const user = await User.create({ name, email, password, role: "hod" });
        const hod = await HOD.create({
            hod_acc: user._id,
            department: department._id,
        });

        // Update the Department to link to the new HOD
        department.hod = hod._id;
        await department.save();

        res.status(201).json({
            msg: "HOD and account created successfully",
            hod,
            credentials: { email: user.email, password },
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// You can add other CRUD operations for HOD here if needed
const getHODs = async (req, res) => {
    try {
        const hods = await HOD.find()
            .populate("hod_acc", "name email")
            .populate("department", "name");
        res.json(hods);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getHODById = async (req, res) => {
    try {
        const hod = await HOD.findById(req.params.id)
            .populate("hod_acc", "name email")
            .populate("department", "name");
        if (!hod) return res.status(404).json({ msg: "HOD not found" });
        res.json(hod);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Delete HOD
const deleteHOD = async (req, res) => {
    try {
        const hod = await HOD.findById(req.params.id);
        if (!hod) return res.status(404).json({ msg: "HOD not found" });

        // Remove the HOD link from the Department
        await Department.findByIdAndUpdate(hod.department, {
            $unset: { hod: 1 },
        });

        await User.findByIdAndDelete(hod.hod_acc);
        await hod.deleteOne();

        res.json({ msg: "HOD and linked user deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createHOD,
    getHODs,
    getHODById,
    deleteHOD,
};