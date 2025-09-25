// controllers/scheduler.controller.js

const Department = require("../models/department.model");
const HOD = require("../models/hod.model");
const Semester = require("../models/semester.model");
const Subject = require("../models/subject.model");
const Teacher = require("../models/teacher.model");

// Generate Timetable
async function generateTimetable(req, res) {
  try {
    // Fetch all departments
    const departments = await Department.find();

    if (!departments.length) {
      return res.status(404).json({ message: "No departments found" });
    }

    // Example: iterate over departments
    const timetableResult = [];

    for (const dept of departments) {
      // Get semesters of this department
      const semesters = await Semester.find({ department: dept._id });

      for (const sem of semesters) {
        // Get subjects of this semester
        const subjects = await Subject.find({ semester: sem._id });

        // Get teachers for these subjects
        const teachers = await Teacher.find({
          _id: { $in: subjects.map((s) => s.teacher) },
        });

        // Dummy timetable generation logic (replace with your algorithm)
        const timetable = subjects.map((sub, idx) => ({
          subject: sub.name,
          teacher: teachers[idx % teachers.length].name,
          day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][
            idx % 5
          ],
          period: (idx % 6) + 1,
        }));

        timetableResult.push({
          department: dept.name,
          semester: sem.name,
          timetable,
        });
      }
    }

    return res.status(200).json({
      message: "Timetable generated successfully",
      data: timetableResult,
    });
  } catch (error) {
    console.error("Error generating timetable:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { generateTimetable };
