import Alert from '../models/alert.model.js';

export const getPublicAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({
            type: { $in: ['Disease Outbreak', 'Lost Pet'] },
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUserAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({
            targetUser: req.user._id,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createAlert = async (req, res) => {
    try {
        const { type, message, lat, lng, daysValid } = req.body;
        
        const newAlert = new Alert({
            type,
            message,
            createdBy: req.user._id,
            expiresAt: new Date(Date.now() + (daysValid || 7) * 24 * 60 * 60 * 1000)
        });

        // Add geospatial data if provided
        if (lat && lng) {
            newAlert.location = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        const savedAlert = await newAlert.save();
        res.status(201).json(savedAlert);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllAlertsAdmin = async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate('createdBy', 'name email')
            .populate('targetUser', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteAlertAdmin = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        res.status(200).json({ message: 'Alert deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};