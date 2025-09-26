const express = require("express");
const router = express.Router();
const { generateTimetable } = require("../controllers/scheduler.controller");
const { protect } = require("../middleware/auth.middleware");

// Route to trigger timetable generation
router.post("/generate", protect, generateTimetable);

module.exports = router;