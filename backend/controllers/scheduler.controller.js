const { fetchDataAndRunScheduler } = require("../utils/scheduler.utils");

const generateTimetable = async (req, res) => {
    try {
        const { constraints } = req.body;
        const newTimetable = await fetchDataAndRunScheduler(constraints);
        res.status(200).json({ msg: "Timetable generated successfully", timetable: newTimetable });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    generateTimetable,
};