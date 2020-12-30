const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    starttime: {
        type: String,
        required: true
    },
    endtime: {
        type: String,
        required: true
    }
});

const timetableSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    monday: [taskSchema],
    tuesday: [taskSchema],
    wednesday: [taskSchema],
    thursday: [taskSchema],
    friday: [taskSchema],
    saturday: [taskSchema],
    sunday: [taskSchema]
});

const Timetable = new mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;