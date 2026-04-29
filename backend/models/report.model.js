import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null // Nullable to allow anonymous public reporting
    },
    species: { 
        type: String, 
        required: true, 
        enum: ['Dog', 'Cat', 'Other'] 
    },
    description: { 
        type: String, 
        required: true,
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    location: {
        type: { 
            type: String, 
            enum: ['Point'], 
            required: true,
            default: 'Point'
        },
        coordinates: { 
            type: [Number], 
            required: true 
        } 
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    imageHash: { 
        type: String, 
        required: true
    },
    status: { 
        type: String, 
        enum: ['Active', 'Resolved', 'Duplicate'], 
        default: 'Active' 
    },
    claimedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    claimProofUrl: { 
        type: String, 
        default: null 
    },
    claimStatus: { 
        type: String, 
        enum: ['None', 'Pending Review', 'Verified', 'Rejected'], 
        default: 'None' 
    }
}, { timestamps: true });

// Create the geospatial index required for $geoNear proximity queries
reportSchema.index({ location: '2dsphere' });

export default mongoose.model('Report', reportSchema);