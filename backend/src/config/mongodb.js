import mongoose from 'mongoose';
import { MONGODB_URI } from './config.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);

        console.log(`✅ MongoDB connected successfully :)`);

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
