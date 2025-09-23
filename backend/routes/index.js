const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const instituteRoutes = require('./institute.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/institutes', instituteRoutes);

module.exports = router;