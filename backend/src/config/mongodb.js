import mongoose from 'mongoose';
import { MONGODB_URI } from './config.js';

// Cache the connection for serverless
let cachedConnection = null;

const connectDB = async () => {
    // Return cached connection if exists (for serverless)
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }
    
    try {
        const connection = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });
        
        cachedConnection = connection;
        console.log('✅ MongoDB Connected');
        return connection;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed');
        // Only exit if not in serverless (Vercel sets this)
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw error;
    }
};

export default connectDB;
