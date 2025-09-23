const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const instituteRoutes = require("./institute.routes");
const facultyRoutes = require("./faculty.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/institutes", instituteRoutes);
router.use("/faculties", facultyRoutes);

module.exports = router;
