const Batch = require("../models/batch.model");
const Subject = require("../models/subject.model");

// ✅ Create Batch
const createBatch = async (req, res) => {
    try {
        const batch = await Batch.create(req.body);
        res.status(201).json(batch);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ✅ Get all Batches
const getBatches = async (req, res) => {
    try {
        const batches = await Batch.find().populate(
            "subjects",
            "name subjectCode"
        );
        res.json(batches);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ✅ Get Batch by ID
const getBatchById = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id).populate(
            "subjects",
            "name subjectCode"
        );
        if (!batch) return res.status(404).json({ msg: "Batch not found" });
        res.json(batch);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ✅ Update Batch
const updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate("subjects", "name subjectCode");
        if (!batch) return res.status(404).json({ msg: "Batch not found" });
        res.json(batch);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ✅ Delete Batch
const deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndDelete(req.params.id);
        if (!batch) return res.status(404).json({ msg: "Batch not found" });
        res.json({ msg: "Batch deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ✅ Add Subject to Batch
const addSubjectToBatch = async (req, res) => {
    try {
        const { subjectId } = req.body;
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ msg: "Batch not found" });

        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ msg: "Subject not found" });

        if (!batch.subjects.includes(subjectId)) {
            batch.subjects.push(subjectId);
            await batch.save();
        }

        const updated = await Batch.findById(req.params.id).populate(
            "subjects",
            "name subjectCode"
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createBatch,
    getBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
    addSubjectToBatch,
};
