const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  term: {
    type: String,
    enum: ['odd', 'even'],
    required: true,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  timetableData: {
    type: mongoose.Schema.Types.Mixed, // Allows for flexible, nested JSON structure
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Timetable', timetableSchema);