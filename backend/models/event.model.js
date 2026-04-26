import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    shelter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter',
        required: true
    },
    title: { type: String, required: true },
    eventType: { type: String, enum: ['Vaccination', 'Sterilization', 'Adoption Drive', 'Fundraiser', 'Other'] },
    description: { type: String },
    date: { type: Date, required: true },
    time: {
        start: { type: String, required: true },
        end: { type: String, required: true }
    },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    registeredAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);