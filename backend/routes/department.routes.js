const express = require("express");
const {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
} = require("../controllers/department.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
const allowedRoles = ["admin", "institute"];

// Only Admin or Institute can manage departments
router.post("/", protect, authorizeRoles(...allowedRoles), createDepartment);
router.get("/", protect, authorizeRoles(...allowedRoles), getDepartments);
router.get("/:id", protect, authorizeRoles(...allowedRoles), getDepartmentById);
router.put("/:id", protect, authorizeRoles(...allowedRoles), updateDepartment);
router.delete(
    "/:id",
    protect,
    authorizeRoles(...allowedRoles),
    deleteDepartment
);

module.exports = router;
