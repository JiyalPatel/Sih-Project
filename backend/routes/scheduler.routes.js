const express = require('express');
const router = express.Router();
const { generateTimetable } = require('../controllers/scheduler.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

// Route to generate the timetable. Only authorized roles can access this.
router.post('/generate', protect, authorizeRoles('admin', 'institute', 'hod', 'dept-admin'), generateTimetable);

module.exports = router;