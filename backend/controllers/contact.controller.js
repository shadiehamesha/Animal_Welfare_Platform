import Contact from '../models/contact.model.js';

// Create a new contact message
export const createMessage = async (req, res) => {
    try {
        const { subject, message } = req.body;

        // Server-side validation
        if (!subject || !subject.trim()) return res.status(400).json({ message: 'Subject is required' });
        if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });
        if (subject.length > 150) return res.status(400).json({ message: 'Subject exceeds 150 characters' });
        if (message.length > 1000) return res.status(400).json({ message: 'Message exceeds 1000 characters' });

        // req.user is set by the protect middleware
        const newContact = new Contact({
            user: req.user._id,
            subject,
            message
        });

        const savedContact = await newContact.save();
        
        res.status(201).json({ 
            message: 'Message sent successfully', 
            contact: savedContact 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Get all messages
export const getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User: Get their own messages
export const getUserMessages = async (req, res) => {
    try {
        const messages = await Contact.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Update message status
export const updateMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const message = await Contact.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};