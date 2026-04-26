import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    shelter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter',
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    taskType: { type: String, enum: ['Rescue', 'Transport', 'Fostering', 'Event Help'] },
    status: { 
        type: String, 
        enum: ['Open', 'Claimed', 'Approved', 'Completed'],
        default: 'Open'
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);