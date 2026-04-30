import Pharmacy from '../models/pharmacy.model.js';
import Medicine from '../models/medicine.model.js';

export const getPharmacies = async (req, res) => {
    try {
        const { city } = req.query;
        let query = {};
        if (city) query.city = { $regex: city, $options: 'i' };

        const pharmacies = await Pharmacy.find(query).sort({ rating: -1 });
        res.status(200).json(pharmacies);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPharmacyById = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findById(req.params.id).populate('reviews.user', 'name');
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
        res.status(200).json(pharmacy);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Manager/Admin routes
export const createPharmacy = async (req, res) => {
    try {
        const newPharmacy = new Pharmacy({ ...req.body, manager: req.user._id });
        const savedPharmacy = await newPharmacy.save();
        res.status(201).json(savedPharmacy);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePharmacy = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findById(req.params.id);
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

        if (pharmacy.manager.toString() !== req.user._id.toString() && req.user.role !== 'system admin') {
            return res.status(403).json({ message: 'Not authorized to update this pharmacy' });
        }

        const updatedPharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json(updatedPharmacy);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reviews logic
export const addPharmacyReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const pharmacy = await Pharmacy.findById(req.params.id);
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

        const alreadyReviewed = pharmacy.reviews.find(r => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed this pharmacy' });

        pharmacy.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
        pharmacy.numReviews = pharmacy.reviews.length;
        pharmacy.rating = pharmacy.reviews.reduce((acc, item) => item.rating + acc, 0) / pharmacy.reviews.length;

        await pharmacy.save();
        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const respondToReview = async (req, res) => {
    try {
        const { response } = req.body;
        const pharmacy = await Pharmacy.findById(req.params.id);
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

        if (pharmacy.manager.toString() !== req.user._id.toString() && req.user.role !== 'system admin') {
            return res.status(403).json({ message: 'Not authorized to respond' });
        }

        const review = pharmacy.reviews.id(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.response = response;
        review.respondedAt = Date.now();
        await pharmacy.save();
        res.status(200).json(pharmacy);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const removeReviewReply = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findById(req.params.id);
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

        if (pharmacy.manager.toString() !== req.user._id.toString() && req.user.role !== 'system admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const review = pharmacy.reviews.id(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.response = "";
        review.respondedAt = undefined;
        await pharmacy.save();
        res.status(200).json(pharmacy);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePharmacyReviewAdmin = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findById(req.params.id);
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

        const reviewIndex = pharmacy.reviews.findIndex(r => r._id.toString() === req.params.reviewId);
        if (reviewIndex === -1) return res.status(404).json({ message: 'Review not found' });

        pharmacy.reviews.splice(reviewIndex, 1);
        pharmacy.numReviews = pharmacy.reviews.length;
        pharmacy.rating = pharmacy.reviews.length > 0 ? pharmacy.reviews.reduce((acc, item) => item.rating + acc, 0) / pharmacy.reviews.length : 0;

        await pharmacy.save();
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePharmacyAdmin = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
        if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
        
        // Clean up linked medicine inventory
        await Medicine.deleteMany({ pharmacy: req.params.id });

        res.status(200).json({ message: 'Pharmacy and associated inventory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};