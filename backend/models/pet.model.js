import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    shelter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter',
        required: true
    },
    name: { type: String, required: true },
    species: { type: String, required: true, enum: ['Dog', 'Cat', 'Other'] },
    breed: { type: String },
    age: { type: String }, // e.g., '2 months', '3 years'
    gender: { type: String, enum: ['Male', 'Female', 'Unknown'] },
    healthStatus: {
        vaccinated: { type: Boolean, default: false },
        sterilized: { type: Boolean, default: false },
        medicalNotes: { type: String }
    },
    adoptionStatus: { 
        type: String, 
        enum: ['Available', 'Pending Review', 'Adopted', 'Fostered'],
        default: 'Available'
    },
    photos: [{ type: String }], // Array of image URLs
    description: { type: String }
}, { timestamps: true });

export default mongoose.model('Pet', petSchema);