const express = require("express");
const {
    createFaculty,
    getFaculties,
    getFacultyById,
    updateFaculty,
    deleteFaculty,
} = require("../controllers/faculty.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
const allowedRoles = ["admin", "institute", "hod", "dept-admin"];

// Admin or institute can manage faculty
router.post("/", protect, authorizeRoles(...allowedRoles), createFaculty);
router.get("/", protect, authorizeRoles(...allowedRoles), getFaculties);
router.get(
    "/:id",
    protect,
    authorizeRoles(...allowedRoles),
    getFacultyById
);
router.put(
    "/:id",
    protect,
    authorizeRoles(...allowedRoles),
    updateFaculty
);
router.delete("/:id", protect, authorizeRoles(...allowedRoles), deleteFaculty);

module.exports = router;
