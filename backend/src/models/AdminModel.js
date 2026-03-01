import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ADMIN_CONFIG } from '../config/config.js';
import { ROLES, ROLE_VALUES } from '../constants/roles.js';

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ROLE_VALUES,
        default: ROLES.ADMIN,
        required: true,
    },
    profilePic: {
        type: String,
        default: null
    },
    firstName: {
        type: String,
        default: null,
        trim: true
    },
    lastName: {
        type: String,
        default: null,
        trim: true
    },
    phone: {
        type: String,
        default: null,
        unique: true,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    weeklyPassword: {
        type: String,
        default: null
    },
    weeklyPasswordExpiresAt: {
        type: Date,
        default: null
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


const Admin = mongoose.model('Admin', AdminSchema);

// Initialize default  admin
export const initializeAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({
            email: ADMIN_CONFIG.email
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 10);
            await Admin.create({
                username: ADMIN_CONFIG.username,
                password: hashedPassword,
                email: ADMIN_CONFIG.email,
                phone: ADMIN_CONFIG.phone,
                profilePic: ADMIN_CONFIG.profilePic,
                firstName: ADMIN_CONFIG.firstName,
                lastName: ADMIN_CONFIG.lastName,
                role: ROLES.ADMIN,
                isActive: true,
                created_by: 'ADMIN'
            });
        }
    } catch (error) {
    }
};

export default Admin;
