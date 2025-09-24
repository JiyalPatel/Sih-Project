const DeptAdmin = require("../models/deptadmin.model");
const User = require("../models/user.models");
const Department = require("../models/department.model");
const HOD = require("../models/hod.model");

// Create a DeptAdmin account (for use by an 'hod' user)
const createDeptAdmin = async (req, res) => {
    try {
        const { name, email, password, departmentId } = req.body;

        const department = await Department.findById(departmentId).populate("hod");
        if (!department) {
            return res.status(404).json({ msg: "Department not found" });
        }
        if (!department.hod) {
            return res.status(400).json({
                msg: "Cannot create Dept Admin for a department without an HOD.",
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: "dept-admin",
        });

        const deptAdmin = await DeptAdmin.create({
            dept_admin_acc: user._id,
            department: department._id,
        });

        res.status(201).json({
            msg: "DeptAdmin and account created successfully",
            deptAdmin,
            credentials: { email: user.email, password },
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ... add other CRUD operations for DeptAdmin here if needed ...
const getDeptAdmins = async (req, res) => {
    try {
        const deptAdmins = await DeptAdmin.find()
            .populate("dept_admin_acc", "name email")
            .populate("department", "name");
        res.json(deptAdmins);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getDeptAdminById = async (req, res) => {
    try {
        const deptAdmin = await DeptAdmin.findById(req.params.id)
            .populate("dept_admin_acc", "name email")
            .populate("department", "name");
        if (!deptAdmin) return res.status(404).json({ msg: "Dept Admin not found" });
        res.json(deptAdmin);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const deleteDeptAdmin = async (req, res) => {
    try {
        const deptAdmin = await DeptAdmin.findById(req.params.id);
        if (!deptAdmin) return res.status(404).json({ msg: "Dept Admin not found" });

        await User.findByIdAndDelete(deptAdmin.dept_admin_acc);
        await deptAdmin.deleteOne();

        res.json({ msg: "Dept Admin and linked user deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createDeptAdmin,
    getDeptAdmins,
    getDeptAdminById,
    deleteDeptAdmin,
};