const Room = require("../models/room.model.js");

// Create room
const createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Get all rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ msg: "Room not found" });
        res.json(room);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Update room
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!room) return res.status(404).json({ msg: "Room not found" });
        res.json(room);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Delete room
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ msg: "Room not found" });
        res.json({ msg: "Room deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
};
