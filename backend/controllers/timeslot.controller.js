const TimeSlot = require("../models/timeslot.model");

const createTimeSlot = async (req, res) => {
    try {
        const timeSlot = await TimeSlot.create(req.body);
        res.status(201).json(timeSlot);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getTimeSlots = async (req, res) => {
    try {
        const timeSlots = await TimeSlot.find()
            .populate("batch", "name")
            .populate("subject", "name subjectCode")
            .populate("faculty", "fac_acc specialization")
            .populate("room", "name classNum");
        res.json(timeSlots);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getTimeSlotById = async (req, res) => {
    try {
        const timeSlot = await TimeSlot.findById(req.params.id)
            .populate("batch", "name")
            .populate("subject", "name subjectCode")
            .populate("faculty", "fac_acc specialization")
            .populate("room", "name classNum");
        if (!timeSlot) {
            return res.status(404).json({ msg: "TimeSlot not found" });
        }
        res.json(timeSlot);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createTimeSlot,
    getTimeSlots,
    getTimeSlotById,
};