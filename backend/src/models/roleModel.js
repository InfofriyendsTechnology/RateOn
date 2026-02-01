import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    role_name: {
        type: String,
        required: true,
        trim: true
    },
    created_by: {
        type: String,
        default: null
    },
    updated_by: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
