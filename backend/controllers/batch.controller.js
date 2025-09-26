// backend/controllers/batch.controller.js
const Batch = require("../models/batch.model");

// ---------- Get all batches ----------
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({})
      // .populate("department", "name")
      // .populate("subjects", "name code"); // populate subject details
    res.json(batches);
  } catch (err) {
    res.status(500).json({ msg: err.message || "Failed to fetch batches" });
  }
};

// ---------- Get a single batch by ID ----------
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("department", "name")
      .populate("subjects", "name code");
    if (!batch) return res.status(404).json({ msg: "Batch not found" });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ msg: err.message || "Failed to fetch batch" });
  }
};

// ---------- Create a new batch ----------
exports.createBatch = async (req, res) => {
  try {
    const { name, sem, strength, department, subjects, avail_days, avail_slots } = req.body;

    if (!name || !sem || !strength || !department) {
      return res.status(400).json({ msg: "Name, sem, strength, and department are required" });
    }

    const batch = new Batch({
      name: name.trim(),
      sem,
      strength,
      department,
      subjects: subjects || [],
      avail_days: avail_days || ["mon", "tue", "wed", "thu", "fri", "sat"],
      avail_slots: avail_slots || ["1","2","3","4","5","6","7","8"]
    });

    await batch.save();
    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ msg: err.message || "Failed to create batch" });
  }
};

// ---------- Update a batch ----------
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ msg: "Batch not found" });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ msg: err.message || "Failed to update batch" });
  }
};

// ---------- Delete a batch ----------
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ msg: "Batch not found" });
    res.json({ msg: "Batch deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message || "Failed to delete batch" });
  }
};
