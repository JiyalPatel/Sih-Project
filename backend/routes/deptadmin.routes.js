const express = require("express");
const {
    createDeptAdmin,
    getDeptAdmins,
    getDeptAdminById,
    deleteDeptAdmin,
} = require("../controllers/deptadmin.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
const allowedRoles = ["admin", "institute", "hod"];

router.post("/", protect, authorizeRoles(...allowedRoles), createDeptAdmin);
router.get("/", protect, authorizeRoles(...allowedRoles), getDeptAdmins);
router.get(
    "/:id",
    protect,
    authorizeRoles(...allowedRoles),
    getDeptAdminById
);
router.delete("/:id", protect, authorizeRoles(...allowedRoles), deleteDeptAdmin);

module.exports = router;