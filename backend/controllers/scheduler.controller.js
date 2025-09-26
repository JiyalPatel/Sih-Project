const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

// Import all necessary models
const Subject = require("../models/subject.model");
const Faculty = require("../models/faculty.model");
const Room = require("../models/room.model");
const Batch = require("../models/batch.model");
const Timetable = require("../models/timetable.model");
const { Script } = require("vm");

const generateTimetable = async (req, res) => {
    try {
        console.log("Starting timetable generation...");

        // Using hardcoded data for testing
        const batches = [
            { id: "B1", name: "B.Tech Year 1 (Sem 1)", semester: 1, strength: 60, subjects: ["S101", "S102", "S103", "S104"], available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "B3", name: "B.Tech Year 2 (Sem 3)", semester: 3, strength: 55, subjects: ["S301", "S302", "S303", "S304"], available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "B5", name: "B.Tech Year 3 (Sem 5)", semester: 5, strength: 50, subjects: ["S501", "S502", "S503", "S504"], available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "B7", name: "B.Tech Year 4 (Sem 7)", semester: 7, strength: 45, subjects: ["S701", "S702", "S703", "S704"], available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
        ];
        const rooms = [
            { id: "R1", name: "Lecture Hall A", type: "lecture", capacity: 120, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "R2", name: "Lecture Hall B", type: "lecture", capacity: 100, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "R3", name: "Lecture Hall C", type: "lecture", capacity: 80, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "R4", name: "Lecture Hall D", type: "lecture", capacity: 70, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "R5", name: "Lecture Hall E", type: "lecture", capacity: 90, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "R6", name: "Lecture Hall F", type: "lecture", capacity: 75, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "R7", name: "Lecture Hall G", type: "lecture", capacity: 60, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "L1", name: "Computer Lab 1", type: "lab", capacity: 60, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "L2", name: "Electronics Lab", type: "lab", capacity: 55, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "L3", name: "Physics Lab", type: "lab", capacity: 50, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "L4", name: "Networks Lab", type: "lab", capacity: 45, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "L5", name: "DB Lab", type: "lab", capacity: 40, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "L6", name: "Capstone Lab", type: "lab", capacity: 65, available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: ["1", "2", "3", "4", "5", "6"] },
        ];
        const faculty = [
            { id: "F01", name: "Dr. A. Sharma", subjects: ["S101", "S301"], max_hours_per_week: 18, max_lab_hours: 8, max_lecture_hours: 14, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F02", name: "Prof. B. Gupta", subjects: ["S102", "S501", "S701"], max_hours_per_week: 16, max_lab_hours: 10, max_lecture_hours: 12, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F03", name: "Dr. C. Iyer", subjects: ["S103", "S303"], max_hours_per_week: 16, max_lab_hours: 6, max_lecture_hours: 12, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F04", name: "Dr. D. Mehta", subjects: ["S104", "S304", "S704"], max_hours_per_week: 14, max_lab_hours: 6, max_lecture_hours: 12, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F05", name: "Prof. E. Rao", subjects: ["S302", "S503"], max_hours_per_week: 18, max_lab_hours: 8, max_lecture_hours: 14, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F06", name: "Dr. F. Khan", subjects: ["S303", "S501"], max_hours_per_week: 14, max_lab_hours: 8, max_lecture_hours: 10, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F07", name: "Dr. G. Patel", subjects: ["S504", "S502"], max_hours_per_week: 16, max_lab_hours: 8, max_lecture_hours: 12, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F08", name: "Prof. H. Singh", subjects: ["S304", "S701"], max_hours_per_week: 16, max_lab_hours: 8, max_lecture_hours: 12, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F09", name: "Dr. I. Desai", subjects: ["S502", "S302"], max_hours_per_week: 14, max_lab_hours: 8, max_lecture_hours: 10, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
            { id: "F10", name: "Dr. J. Roy", subjects: ["S701", "S702", "S703"], max_hours_per_week: 12, max_lab_hours: 8, max_lecture_hours: 10, preferred_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], preferred_slots: ["1", "2", "3", "4", "5", "6"] },
        ];
        const subjects = [
            { id: "S101", name: "Engineering Mathematics I", lab: false, duration_slots: 1, hours_per_week: 3, semester: 1, },
            { id: "S102", name: "Introduction to Programming Lab", lab: true, lab_block_size: 2, hours_per_week: 2, semester: 1, },
            { id: "S103", name: "Physics for Engineers", lab: false, duration_slots: 1, hours_per_week: 3, semester: 1, },
            { id: "S104", name: "Basic Chemistry", lab: false, duration_slots: 1, hours_per_week: 3, semester: 1, },
            { id: "S301", name: "Digital Systems Lab", lab: true, lab_block_size: 2, hours_per_week: 2, semester: 3, },
            { id: "S302", name: "Data Structures and Algorithms", lab: false, duration_slots: 1, hours_per_week: 3, semester: 3, },
            { id: "S303", name: "Electronic Circuits", lab: false, duration_slots: 1, hours_per_week: 3, semester: 3, },
            { id: "S304", name: "Signals and Systems", lab: false, duration_slots: 1, hours_per_week: 3, semester: 3, },
            { id: "S501", name: "Microcontroller Lab", lab: true, lab_block_size: 2, hours_per_week: 2, semester: 5, },
            { id: "S502", name: "Database Systems Lab", lab: true, lab_block_size: 2, hours_per_week: 2, semester: 5, },
            { id: "S503", name: "Operating Systems", lab: false, duration_slots: 1, hours_per_week: 3, semester: 5, },
            { id: "S504", name: "Computer Networks", lab: false, duration_slots: 1, hours_per_week: 3, semester: 5, },
            { id: "S701", name: "Capstone Project Lab", lab: true, lab_block_size: 2, hours_per_week: 2, semester: 7, },
            { id: "S702", name: "Advanced Topics in AI", lab: false, duration_slots: 1, hours_per_week: 3, semester: 7, },
            { id: "S703", name: "Professional Ethics & Management", lab: false, duration_slots: 1, hours_per_week: 2, semester: 7, },
            { id: "S704", name: "Seminar and Presentation", lab: false, duration_slots: 1, hours_per_week: 1, semester: 7, },
        ];

        const pythonScriptDir = path.join(__dirname, "..", "app", "v2");
        const dataDir = path.join(pythonScriptDir, "Data");
        const outputDir = path.join(dataDir, "output");
        await fs.mkdir(outputDir, { recursive: true });

        await Promise.all([
            fs.writeFile(path.join(dataDir, "subjects.json"), JSON.stringify(subjects, null, 4)),
            fs.writeFile(path.join(dataDir, "faculty.json"), JSON.stringify(faculty, null, 4)),
            fs.writeFile(path.join(dataDir, "classrooms.json"), JSON.stringify(rooms, null, 4)),
            fs.writeFile(path.join(dataDir, "batches.json"), JSON.stringify(batches, null, 4)),
        ]);
        
        console.log("Data files created for Python script.");

        const pythonScriptPath = path.join(pythonScriptDir, "main.py");
        
        // *** THIS IS THE KEY CHANGE ***
        // Set the current working directory for the python script
        const pythonProcess = spawn("python", [pythonScriptPath], { cwd: pythonScriptDir });

        console.log(pythonProcess);
        

        let scriptOutput = "";
        pythonProcess.stdout.on("data", (data) => {
            console.log(`Python script stdout: ${data}`);
            scriptOutput += data.toString();
        });

        console.log(scriptOutput);
        

        let scriptError = "";
        pythonProcess.stderr.on("data", (data) => {
            console.error(`Python script stderr: ${data}`);
            scriptError += data.toString();
        });

        pythonProcess.on("close", async (code) => {
            console.log(`Python script exited with code ${code}`);

            if (code !== 0) {
                return res.status(500).json({ 
                    message: "Timetable generation failed.",
                    error: scriptError 
                });
            }

            const resultPath = path.join(outputDir, "timetable_top_1.json");
            try {
                const resultData = await fs.readFile(resultPath, "utf-8");
                const generatedSlots = JSON.parse(resultData);
                
                await Timetable.deleteMany({ institute: req.user.institute });

                const newTimetable = new Timetable({
                    institute: req.user.institute,
                    slots: generatedSlots,
                    generatedAt: new Date(),
                });

                await newTimetable.save();

                console.log("Timetable generated and saved successfully!");
                res.status(201).json({
                    message: "Timetable generated successfully!",
                    timetable: newTimetable,
                });
            } catch (fileError) {
                console.error("Error reading or processing output file:", fileError);
                res.status(500).json({
                    message: "Script ran, but could not process the output file.",
                    error: scriptError,
                });
            }
        });

    } catch (error) {
        console.error("Error generating timetable:", error);
        res.status(500).json({ message: "Server error during timetable generation." });
    }
};

module.exports = { generateTimetable };
