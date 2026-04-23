import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    response: { type: String },
    respondedAt: { type: Date }
}, { timestamps: true });

const hospitalSchema = new mongoose.Schema({
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    hours: {
        open: { type: String, required: true },
        close: { type: String, required: true },
        is24_7: { type: Boolean, default: false }
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String },
        website: { type: String }
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema]
}, { timestamps: true });

export default mongoose.model('Hospital', hospitalSchema);