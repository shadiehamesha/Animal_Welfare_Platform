import Event from '../models/event.model.js';
import Shelter from '../models/shelter.model.js';

export const getPublicEvents = async (req, res) => {
    try {
        const { shelter } = req.query;
        if (!shelter) return res.status(400).json({ message: 'Shelter ID is required' });

        // Only return upcoming events
        const events = await Event.find({ 
            shelter: shelter,
            date: { $gte: new Date().setHours(0, 0, 0, 0) } 
        }).sort({ date: 1 });
        
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createEvent = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

        const newEvent = new Event({ ...req.body, shelter: shelter._id });
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getShelterEvents = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        const events = await Event.find({ shelter: shelter._id }).sort({ date: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};