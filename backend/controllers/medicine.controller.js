import Medicine from '../models/medicine.model.js';
import Pharmacy from '../models/pharmacy.model.js';

// Public Search
export const searchMedicines = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query is required' });

        const medicines = await Medicine.find({ name: { $regex: q, $options: 'i' } })
            .populate('pharmacy', 'name location address contact')
            .sort({ inStock: -1 });

        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getInventory = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findOne({ manager: req.user._id });
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy profile not found. Please create one first.' });

        const medicines = await Medicine.find({ pharmacy: pharmacy._id }).sort({ createdAt: -1 });
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addMedicine = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findOne({ manager: req.user._id });
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy profile not found.' });

        const newMedicine = new Medicine({ ...req.body, pharmacy: pharmacy._id });
        const savedMedicine = await newMedicine.save();
        res.status(201).json(savedMedicine);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateMedicine = async (req, res) => {
    try {
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );
        if (!updatedMedicine) return res.status(404).json({ message: 'Medicine not found' });
        res.status(200).json(updatedMedicine);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        res.status(200).json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};