const Department = require("../models/department.model");
const Institute = require("../models/institute.model");

// Create a new Department linked to an Institute
const createDepartment = async (req, res) => {
    try {
        const { name, instituteId } = req.body;

        const institute = await Institute.findById(instituteId);
        if (!institute) {
            return res.status(404).json({ msg: "Institute not found" });
        }

        const newDepartment = await Department.create({
            name,
            institute: instituteId,
        });

        res.status(201).json(newDepartment);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Get all Departments
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate("hod", "name email")
            .populate("institute", "name");
        res.json(departments);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Get a single Department by ID
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate("hod", "name email")
            .populate("institute", "name");
        if (!department) {
            return res.status(404).json({ msg: "Department not found" });
        }
        res.json(department);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Update a Department
const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate("hod", "name email");
        if (!department) {
            return res.status(404).json({ msg: "Department not found" });
        }
        res.json(department);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Delete a Department
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ msg: "Department not found" });
        }
        res.json({ msg: "Department deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
};
    