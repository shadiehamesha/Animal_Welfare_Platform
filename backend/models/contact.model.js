import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    subject: { 
        type: String, 
        required: [true, 'Subject is required'], 
        trim: true,
        maxLength: [150, 'Subject cannot exceed 150 characters']
    },
    message: { 
        type: String, 
        required: [true, 'Message is required'], 
        trim: true,
        maxLength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: { 
        type: String, 
        enum: ['pending', 'reviewed', 'resolved'], 
        default: 'pending' 
    }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);