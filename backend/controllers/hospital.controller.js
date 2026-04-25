import Hospital from '../models/hospital.model.js';

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
export const getHospitals = async (req, res) => {
    try {
        const { city } = req.query;
        let query = {};

        // Filter by city if provided (case-insensitive)
        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        // Fetch and sort by highest rating
        const hospitals = await Hospital.find(query).sort({ rating: -1 });
        res.status(200).json(hospitals);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get hospital by ID
// @route   GET /api/hospitals/:id
// @access  Public
export const getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id).populate('reviews.user', 'name');
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new hospital listing
// @route   POST /api/hospitals
// @access  Private/HospitalManager
export const createHospital = async (req, res) => {
    try {
        const newHospital = new Hospital({
            ...req.body,
            manager: req.user._id // Assign logged-in user as manager
        });

        const savedHospital = await newHospital.save();
        res.status(201).json(savedHospital);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update hospital details
// @route   PUT /api/hospitals/:id
// @access  Private/HospitalManager
export const updateHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Ensure the user updating is the manager or an admin
        if (hospital.manager.toString() !== req.user._id.toString() && req.user.role !== 'system admin') {
            return res.status(403).json({ message: 'Not authorized to update this hospital' });
        }

        const updatedHospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedHospital);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/hospitals/:id/reviews
// @access  Private
export const addHospitalReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Check if user already reviewed
        const alreadyReviewed = hospital.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this hospital' });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        };

        hospital.reviews.push(review);
        hospital.numReviews = hospital.reviews.length;
        
        // Calculate new average rating
        hospital.rating = hospital.reviews.reduce((acc, item) => item.rating + acc, 0) / hospital.reviews.length;

        await hospital.save();
        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Respond to a review
// @route   PUT /api/hospitals/:id/reviews/:reviewId/respond
// @access  Private/HospitalManager
export const respondToReview = async (req, res) => {
    try {
        const { response } = req.body;
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Ensure only the manager or an admin can reply
        if (hospital.manager.toString() !== req.user._id.toString() && req.user.role !== 'system admin') {
            return res.status(403).json({ message: 'Not authorized to respond' });
        }

        const review = hospital.reviews.id(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.response = response;
        review.respondedAt = Date.now();

        await hospital.save();
        res.status(200).json(hospital);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/hospitals/:id/reviews/:reviewId
// @access  Private/HospitalManager
export const deleteHospitalReview = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Ensure only the manager or an admin can delete
        if (hospital.manager.toString() !== req.user._id.toString() && req.user.role !== 'system admin') {
            return res.status(403).json({ message: 'Not authorized to delete reviews' });
        }

        const reviewIndex = hospital.reviews.findIndex(
            (r) => r._id.toString() === req.params.reviewId
        );

        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }

        hospital.reviews.splice(reviewIndex, 1);
        hospital.numReviews = hospital.reviews.length;
        
        // Calculate new average rating
        if (hospital.reviews.length > 0) {
            hospital.rating = hospital.reviews.reduce((acc, item) => item.rating + acc, 0) / hospital.reviews.length;
        } else {
            hospital.rating = 0;
        }

        await hospital.save();
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a hospital completely
// @route   DELETE /api/hospitals/:id
// @access  Private/Admin
export const deleteHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        
        res.status(200).json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};