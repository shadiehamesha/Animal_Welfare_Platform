import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Disease Outbreak', 'Lost Pet', 'Immunization Reminder']
    },
    message: { type: String, required: true },
    location: { // For geotargeted alerts
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }
    },
    targetUser: { // For personalized reminders
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

alertSchema.index({ location: '2dsphere' });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired alerts

export default mongoose.model('Alert', alertSchema);