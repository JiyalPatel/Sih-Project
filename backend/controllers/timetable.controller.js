const Timetable = require("../models/timetable.model");

const createTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.create(req.body);
        res.status(201).json(timetable);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find()
            .populate("batch", "name semester")
            .populate({
                path: "slots",
                populate: [
                    { path: "subject", select: "name subjectCode" },
                    { path: "faculty", select: "fac_acc" },
                    { path: "room", select: "name" },
                ],
            });
        res.json(timetables);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getTimetableById = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id)
            .populate("batch", "name semester")
            .populate({
                path: "slots",
                populate: [
                    { path: "subject", select: "name subjectCode" },
                    { path: "faculty", select: "fac_acc" },
                    { path: "room", select: "name" },
                ],
            });
        if (!timetable) {
            return res.status(404).json({ msg: "Timetable not found" });
        }
        res.json(timetable);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getTimetableByBatchId = async (req, res) => {
    try {
        const timetable = await Timetable.findOne({
            batch: req.params.batchId,
        })
            .populate("batch", "name semester")
            .populate({
                path: "slots",
                populate: [
                    { path: "subject", select: "name subjectCode" },
                    { path: "faculty", select: "fac_acc" },
                    { path: "room", select: "name" },
                ],
            });

        if (!timetable) {
            return res.status(404).json({ msg: "Timetable not found for this batch" });
        }
        res.json(timetable);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createTimetable,
    getTimetables,
    getTimetableById,
    getTimetableByBatchId,
};