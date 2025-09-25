const Department = require('../models/department.model');
const Faculty = require('../models/faculty.model');
const Subject = require('../models/subject.model');
const Room = require('../models/room.model');
const Timetable = require('../models/timetable.model');
const Batch = require('../models/batch.model');
const timetableConstraints = require('../app/v2/Data/timetable_constraints.json');

// Helper function to determine the current academic term (odd/even)
const isOddTerm = () => {
  const month = new Date().getMonth() + 1; // getMonth() is 0-indexed
  // Odd term typically runs from July to December
  return month >= 7 && month <= 12;
};

const generateTimetable = async (req, res) => {
  try {
    // 1. Set constraints based on the current term (odd/even)
    const termType = isOddTerm() ? 'odd' : 'even';
    if (termType === 'odd') {
      timetableConstraints.combine_semesters = [1, 3, 5, 7];
    } else {
      timetableConstraints.combine_semesters = [2, 4, 6, 8];
    }

    // 2. Fetch all required data from the database
    const departments = await Department.find();
    const faculties = await Faculty.find();
    const subjects = await Subject.find();
    const rooms = await Room.find();
    // Find the most recent batch to associate the timetable with
    const latestBatch = await Batch.findOne().sort({ createdAt: -1 });

    if (!latestBatch) {
      return res.status(404).json({ message: "No batches found. Please create a batch before generating a timetable." });
    }

    // 3. Initialize data structures for scheduling
    const generatedTimetable = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-3:00', '3:00-4:00', '4:00-5:00'];

    // Availability trackers to prevent clashes
    const facultyAvailability = {};
    faculties.forEach(faculty => {
      facultyAvailability[faculty._id] = {};
      days.forEach(day => {
        facultyAvailability[faculty._id][day] = {};
        timeSlots.forEach(slot => {
          facultyAvailability[faculty._id][day][slot] = true; // true means available
        });
      });
    });

    const roomAvailability = {};
    rooms.forEach(room => {
      roomAvailability[room._id] = {};
      days.forEach(day => {
        roomAvailability[room._id][day] = {};
        timeSlots.forEach(slot => {
          roomAvailability[room._id][day][slot] = true; // true means available
        });
      });
    });

    // 4. Core Timetable Generation Logic
    for (const department of departments) {
      generatedTimetable[department.name] = {};
      for (const semester of timetableConstraints.combine_semesters) {
        generatedTimetable[department.name][`Semester ${semester}`] = {};
        days.forEach(day => {
          generatedTimetable[department.name][`Semester ${semester}`][day] = {};
          timeSlots.forEach(slot => {
            generatedTimetable[department.name][`Semester ${semester}`][day][slot] = null; // Initialize slot as empty
          });
        });

        const semesterSubjects = subjects.filter(s => s.semester === semester && s.department.toString() === department._id.toString());

        for (const subject of semesterSubjects) {
          let placed = false;
          for (const day of days) {
            for (const slot of timeSlots) {
              // Find an available faculty who can teach the subject
              const assignedFaculty = faculties.find(f => f.subjects.includes(subject._id) && facultyAvailability[f._id][day][slot]);
              // Find an available room in the department
              const assignedRoom = rooms.find(r => r.department.toString() === department._id.toString() && r.capacity >= 60 && roomAvailability[r._id][day][slot] && !r.isLab);
              // Check if the current slot is empty
              const isSlotFree = generatedTimetable[department.name][`Semester ${semester}`][day][slot] === null;

              if (assignedFaculty && assignedRoom && isSlotFree) {
                // If all conditions met, place the class in the timetable
                generatedTimetable[department.name][`Semester ${semester}`][day][slot] = {
                  subject: subject.name,
                  faculty: assignedFaculty.name,
                  room: assignedRoom.name,
                };
                // Mark faculty and room as unavailable for this slot
                facultyAvailability[assignedFaculty._id][day][slot] = false;
                roomAvailability[assignedRoom._id][day][slot] = false;
                placed = true;
                break; // Move to the next subject
              }
            }
            if (placed) break; // Move to the next subject
          }
        }
      }
    }

    // 5. Save the newly generated timetable to the database
    const newTimetable = new Timetable({
      term: termType,
      batch: latestBatch._id,
      timetableData: generatedTimetable,
    });
    await newTimetable.save();

    res.status(201).json({ message: 'Timetable generated successfully!', timetable: newTimetable });

  } catch (error) {
    console.error("Error in generateTimetable:", error); // Log the full error to the console
    res.status(500).json({ message: 'Error generating timetable', error: error.message });
  }
};

module.exports = {
  generateTimetable,
};