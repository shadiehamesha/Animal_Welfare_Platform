import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['normal user', 'system admin', 'organizations/shelters', 'pharmacies', 'hospitals/veterinarians'],
        default: 'normal user'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;