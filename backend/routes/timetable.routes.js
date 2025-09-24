const express = require("express");
const router = express.Router();
const {
    createTimetable,
    getTimetables,
    getTimetableById,
    getTimetableByBatchId,
} = require("../controllers/timetable.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

const allowedRoles = ["admin", "institute", "hod", "dept-admin", "faculty"];

router.post("/", protect, authorizeRoles(...allowedRoles), createTimetable);
router.get("/", protect, authorizeRoles(...allowedRoles), getTimetables);
router.get("/:id", protect, authorizeRoles(...allowedRoles), getTimetableById);
router.get(
    "/batch/:batchId",
    protect,
    authorizeRoles(...allowedRoles),
    getTimetableByBatchId
);

module.exports = router;
