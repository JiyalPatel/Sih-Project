const express = require("express");
const router = express.Router();
const { generateTimetable } = require("../controllers/scheduler.controller");

router.post("/generate", generateTimetable); // function reference, not call

module.exports = router;
