const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const instituteRoutes = require("./institute.routes");
const facultyRoutes = require("./faculty.routes");
const subjectRoutes = require("./subject.routes");
const roomRoutes = require("./room.routes");
const batchRoutes = require("./batch.routes");
const hodRoutes = require("./hod.routes");
const deptAdminRoutes = require("./deptadmin.routes");
const departmentRoutes = require("./department.routes");
const schedulerRoutes = require("./scheduler.routes");
const timetableRoutes = require("./timetable.routes");
const timeslotRoutes = require("./timeslot.routes");

router.use("/", schedulerRoutes);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/institutes", instituteRoutes);
router.use("/faculties", facultyRoutes);
router.use("/subjects", subjectRoutes);
router.use("/rooms", roomRoutes);
router.use("/batches", batchRoutes);
router.use("/hods", hodRoutes);
router.use("/dept-admins", deptAdminRoutes);
router.use("/departments", departmentRoutes);
router.use("/timetables", timetableRoutes);
router.use("/timeslots", timeslotRoutes);

module.exports = router;
