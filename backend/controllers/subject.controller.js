const Subject = require("../models/subject.model");
const Faculty = require("../models/faculty.model");

// Create Subject
const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);

    // if faculty provided, append this subject to faculty’s subjects list
    if (subject.faculty) {
      await Faculty.findByIdAndUpdate(subject.faculty, {
        $addToSet: { subjects: subject._id },
      });
    }

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get all Subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate("faculty", "fac_acc");
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get single subject
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate(
      "faculty",
      "fac_acc"
    );
    if (!subject) return res.status(404).json({ msg: "Subject not found" });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Update Subject
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ msg: "Subject not found" });

    const oldFaculty = subject.faculty;

    // update fields
    Object.assign(subject, req.body);
    await subject.save();

    // if faculty changed, sync faculty’s subject list
    if (req.body.faculty && req.body.faculty.toString() !== oldFaculty?.toString()) {
      if (oldFaculty) {
        await Faculty.findByIdAndUpdate(oldFaculty, {
          $pull: { subjects: subject._id },
        });
      }
      await Faculty.findByIdAndUpdate(req.body.faculty, {
        $addToSet: { subjects: subject._id },
      });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Delete Subject
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ msg: "Subject not found" });

    if (subject.faculty) {
      await Faculty.findByIdAndUpdate(subject.faculty, {
        $pull: { subjects: subject._id },
      });
    }

    await subject.deleteOne();
    res.json({ msg: "Subject deleted and faculty updated" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
