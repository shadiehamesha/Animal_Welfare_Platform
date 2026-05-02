import Shelter from '../models/shelter.model.js';
import Pet from '../models/pet.model.js';
import Event from '../models/event.model.js';

export const getPublicOrganizations = async (req, res) => {
    try {
        const { city } = req.query;
        // Only return verified shelters to the public directory
        let query = { isVerified: true }; 
        
        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        const shelters = await Shelter.find(query).sort({ createdAt: -1 });
        res.status(200).json(shelters);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getMyShelter = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        if (!shelter) return res.status(404).json({ message: 'Organization profile not found' });
        res.status(200).json(shelter);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createOrUpdateShelter = async (req, res) => {
    try {
        let shelter = await Shelter.findOne({ manager: req.user._id });
        
        if (shelter) {
            shelter = await Shelter.findByIdAndUpdate(shelter._id, { $set: req.body }, { new: true });
        } else {
            shelter = new Shelter({ ...req.body, manager: req.user._id });
            await shelter.save();
        }
        res.status(200).json(shelter);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Adoption Analytics
export const getShelterAnalytics = async (req, res) => {
    try {
        const shelter = await Shelter.findOne({ manager: req.user._id });
        if (!shelter) return res.status(404).json({ message: 'Organization not found' });

        // Overall Status Breakdown
        const stats = await Pet.aggregate([
            { $match: { shelter: shelter._id } },
            { $group: { _id: "$adoptionStatus", count: { $sum: 1 } } }
        ]);

        const formattedStats = stats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, { 'Available': 0, 'Pending Review': 0, 'Adopted': 0, 'Fostered': 0 });

        // Adoption Data For Last 6 Months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const timeSeriesAdoptions = await Pet.aggregate([
            { $match: { shelter: shelter._id, adoptionStatus: 'Adopted', updatedAt: { $gte: sixMonthsAgo } } },
            { 
                $group: { 
                    _id: { month: { $month: "$updatedAt" }, year: { $year: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.status(200).json({ 
            totalPets: await Pet.countDocuments({ shelter: shelter._id }), 
            breakdown: formattedStats,
            monthlyAdoptions: timeSeriesAdoptions
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllOrganizations = async (req, res) => {
    try {
        const shelters = await Shelter.find().populate('manager', 'name email').sort({ createdAt: -1 });
        res.status(200).json(shelters);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const verifyOrganization = async (req, res) => {
    try {
        const shelter = await Shelter.findByIdAndUpdate(
            req.params.id, 
            { isVerified: true }, 
            { new: true }
        );
        if (!shelter) return res.status(404).json({ message: 'Organization not found' });
        res.status(200).json(shelter);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteOrganization = async (req, res) => {
    try {
        const shelter = await Shelter.findByIdAndDelete(req.params.id);
        if (!shelter) return res.status(404).json({ message: 'Organization not found' });
        
        await Pet.deleteMany({ shelter: req.params.id });
        await Event.deleteMany({ shelter: req.params.id });

        res.status(200).json({ message: 'Organization and associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};