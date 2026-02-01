import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const PORT = process.env.PORT || 5000;
export const DB_NAME = process.env.DB_NAME;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT || 3306;
export const TIMEZONE = process.env.TIMEZONE || 'UTC';
export const JWT_SECRET = process.env.JWT_SECRET;
export const CLIENT_URL = process.env.CLIENT_URL;
export const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const MONGODB_URI = process.env.MONGODB_URI;

export const OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY: {
        DEFAULT: 5 * 60 * 1000, // 5 minutes
        RESET_PASSWORD: 10 * 60 * 1000 // 10 minutes
    }
};

export const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};


export const ADMIN_CONFIG = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    email: process.env.ADMIN_EMAIL,
    phone: process.env.ADMIN_PHONE,
    profilePic: process.env.ADMIN_PROFILE_PIC,
    firstName: process.env.ADMIN_FIRST_NAME,
    lastName: process.env.ADMIN_LAST_NAME,
};