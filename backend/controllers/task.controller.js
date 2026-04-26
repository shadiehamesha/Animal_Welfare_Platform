import Task from '../models/task.model.js';
import Shelter from '../models/shelter.model.js';

export const getPublicTasks = async (req, res) => {
    try {
        const { shelter, status } = req.query;
        if (!shelter) return res.status(400).json({ message: 'Shelter ID is required' });

        let query = { shelter: shelter };
        if (status) query.status = status; // Typically used to fetch only 'Open' tasks

        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createVolunteerTask = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        const newTask = new Task({ ...req.body, shelter: shelter._id });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getTasks = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        const tasks = await Task.find({ shelter: shelter._id }).populate('volunteer', 'name email');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const approveVolunteerTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('volunteer', 'name email');
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.status = 'Approved';
        await task.save();

        console.log(`[EMAIL DISPATCH] To: Shelter Staff | Subject: Volunteer Approved | Message: ${task.volunteer.name} has been approved for task: ${task.title}. Please follow up.`);

        res.status(200).json({ message: 'Task approved and notification sent to staff', task });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};