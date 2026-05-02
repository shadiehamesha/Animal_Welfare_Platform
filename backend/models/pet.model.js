import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    shelter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter',
        required: function() { return !this.owner; } // required if not owned by a user
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    name: { type: String, required: true },
    species: { type: String, required: true, enum: ['Dog', 'Cat', 'Other'] },
    breed: { type: String },
    age: { type: String }, 
    size: { type: String, enum: ['Small', 'Medium', 'Large', 'Unknown'], default: 'Unknown' },
    gender: { type: String, enum: ['Male', 'Female', 'Unknown'] },
    healthStatus: {
        vaccinated: { type: Boolean, default: false },
        sterilized: { type: Boolean, default: false },
        medicalNotes: { type: String }
    },
    vaccinationSchedule: [{ // For immunization alerts
        vaccineName: { type: String, required: true },
        dueDate: { type: Date, required: true },
        status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
    }],
    adoptionStatus: { 
        type: String, 
        enum: ['Available', 'Pending Review', 'Adopted', 'Fostered'],
        default: 'Available'
    },
    photos: [{ type: String }], // Array of image URLs
    description: { type: String }
}, { timestamps: true });

export default mongoose.model('Pet', petSchema);