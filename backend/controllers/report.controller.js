import Report from '../models/report.model.js';

// Utility: Calculate the Hamming distance between two hash strings
const calculateHammingDistance = (hash1, hash2) => {
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) distance++;
    }
    return distance;
};

// @desc    Submit a new stray report (with image deduplication)
// @route   POST /api/reports
// @access  Public
export const submitReport = async (req, res) => {
    try {
        // imageUrl and imageHash are assumed to be attached to req.body by the preceding multer/sharp middleware
        const { species, description, lat, lng, imageUrl, imageHash, forceSubmit } = req.body;
        
        // If the user was already warned of a duplicate and visually confirmed it's a DIFFERENT animal, forceSubmit is true
        if (!forceSubmit) {
            // Time boundary: Only check against reports from the last 72 hours
            const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

            // Geospatial Query: Find active reports of the same species within a 1km radius
            const nearbyReports = await Report.find({
                species,
                status: 'Active',
                createdAt: { $gte: seventyTwoHoursAgo },
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        $maxDistance: 1000 // 1000 meters = 1 km
                    }
                }
            });

            // Perceptual Hashing Check
            let potentialDuplicate = null;
            for (const report of nearbyReports) {
                const distance = calculateHammingDistance(imageHash, report.imageHash);
                if (distance <= 5) {
                    potentialDuplicate = report;
                    break;
                }
            }

            // Catch duplicate re-uploads
            if (potentialDuplicate) {
                return res.status(409).json({
                    message: 'Potential duplicate detected. Is this the same animal?',
                    duplicateRecord: potentialDuplicate
                });
            }
        }

        const newReport = new Report({
            reporter: req.user ? req.user._id : null, 
            species,
            description,
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            imageUrl,
            imageHash
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get public stray reports (Obfuscated Locations)
// @route   GET /api/reports/public
// @access  Public
export const getPublicReports = async (req, res) => {
    try {
        // Exclude reports that have a verified claim
        const reports = await Report.find({ status: 'Active', claimStatus: { $ne: 'Verified' } });

        // Privacy First: Obfuscate the exact coordinates for the public view
        const obfuscatedReports = reports.map(report => {
            const doc = report.toObject();
            
            // Generate a random offset between -0.005 and 0.005 degrees (approx 500 meters)
            const latOffset = (Math.random() - 0.5) * 0.01;
            const lngOffset = (Math.random() - 0.5) * 0.01;
            
            doc.location.coordinates[0] += lngOffset;
            doc.location.coordinates[1] += latOffset;
            
            // Strip sensitive backend data before sending to the client
            delete doc.imageHash;
            delete doc.reporter;
            delete doc.claimedBy; 
            
            return doc;
        });

        res.status(200).json(obfuscatedReports);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get exact coordinates for heatmap generation
// @route   GET /api/reports/analytics/heatmap
// @access  Protected (Admin, Hospital, Shelter)
export const getHeatmapAnalytics = async (req, res) => {
    try {
        // Authorization gatekeeper: Only specific roles can see exact locations
        const allowedRoles = ['system admin', 'organizations/shelters', 'hospitals/veterinarians'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to view geospatial analytics.' });
        }

        // Fetch exact coordinates
        const reports = await Report.find({ status: 'Active' }).select('location species createdAt');

        const heatmapData = reports.map(r => ({
            lat: r.location.coordinates[1],
            lng: r.location.coordinates[0],
            weight: 1 // Baseline weight.
        }));

        res.status(200).json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const claimReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) return res.status(404).json({ message: 'Report not found' });
        if (report.claimStatus === 'Pending Review' || report.claimStatus === 'Verified') {
            return res.status(400).json({ message: 'This animal is already being claimed or has been verified.' });
        }

        report.claimedBy = req.user._id;
        report.claimProofUrl = req.body.imageUrl;
        report.claimStatus = 'Pending Review';

        await report.save();
        res.status(200).json({ message: 'Claim submitted successfully. Pending admin review.', report });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllReportsAdmin = async (req, res) => {
    try {
        // Fetch all exact reports and populate users
        const reports = await Report.find()
            .populate('reporter', 'name email')
            .populate('claimedBy', 'name email')
            .sort({ createdAt: -1 });
            
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteReportAdmin = async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json({ message: 'Report completely deleted from the system' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const reviewClaim = async (req, res) => {
    try {
        const { action } = req.body;
        const report = await Report.findById(req.params.id);
        
        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (action === 'approve') {
            report.claimStatus = 'Verified';
            report.status = 'Resolved';
        } else if (action === 'reject') {
            report.claimStatus = 'Rejected';
            report.claimProofUrl = null;
            report.claimedBy = null;
        } else {
            return res.status(400).json({ message: 'Invalid action. Use approve or reject.' });
        }

        await report.save();
        res.status(200).json({ message: `Claim successfully ${action}d.`, report });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};