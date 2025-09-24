const express = require("express");
const router = express.Router();
const {
    createTimeSlot,
    getTimeSlots,
    getTimeSlotById,
} = require("../controllers/timeslot.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

const allowedRoles = ["admin", "institute", "hod", "dept-admin"];

router.post("/", protect, authorizeRoles(...allowedRoles), createTimeSlot);
router.get("/", protect, authorizeRoles(...allowedRoles), getTimeSlots);
router.get("/:id", protect, authorizeRoles(...allowedRoles), getTimeSlotById);

module.exports = router;