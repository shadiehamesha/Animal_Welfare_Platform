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
        // Populating the registeredAttendees so the shelter manager can see names and emails
        const events = await Event.find({ shelter: shelter._id })
            .populate('registeredAttendees', 'name email')
            .sort({ date: 1 });
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

// @desc    Register a user for an event
// @route   POST /api/events/:id/attend
export const attendEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Prevent users from registering for past events
        if (new Date(event.date) < new Date().setHours(0,0,0,0)) {
            return res.status(400).json({ message: 'Cannot register for a past event' });
        }

        // Check if user is already in the array
        if (event.registeredAttendees.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Check capacity limits
        if (event.registeredAttendees.length >= event.capacity) {
            return res.status(400).json({ message: 'This event has reached full capacity' });
        }

        // Push the user ID to the array and save
        event.registeredAttendees.push(req.user._id);
        await event.save();

        res.status(200).json({ message: 'Successfully registered for the event', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all events for Admin management
// @route   GET /api/events/admin/all
export const getAllEventsAdmin = async (req, res) => {
    try {
        // Fetch all events and populate shelter name for the admin table
        const events = await Event.find()
            .populate('shelter', 'organizationName city')
            .sort({ date: -1 });
            
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};