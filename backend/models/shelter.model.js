import mongoose from 'mongoose';

const shelterSchema = new mongoose.Schema({
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationName: { type: String, required: true },
    registrationNumber: { type: String },
    description: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true },
        website: { type: String }
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

export default mongoose.model('Shelter', shelterSchema);