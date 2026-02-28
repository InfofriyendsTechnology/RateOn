import cors from "cors";
import express from "express";
import { createServer } from "http";
import session from "express-session";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import connectDB from "./config/mongodb.js";
import { initializeDatabase } from "./models/index.js";
import { PORT, FRONTEND_URL } from "./config/config.js";
import responseHandler from "./utils/responseHandler.js";
import passportConfig from "./config/passport.js";
import { initializeSocket } from "./services/websocket/notificationSocket.js";
import { cleanupOrphanedData, startCleanupScheduler } from "./services/cleanupOrphanedData.js";

const app = express();

const server = createServer(app);

app.use(cors({
    origin: ['http://localhost:5300', 'http://127.0.0.1:5300', 'https://rateon.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session enabled for business Google OAuth flow
app.use(session({
    secret: process.env.SESSION_SECRET || 'rateon-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true, // Save session even if unmodified (needed for OAuth flow)
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        sameSite: 'lax', // Allow cookie to be sent on redirect from Google
        maxAge: 1000 * 60 * 60, // 1 hour
        path: '/' // Ensure cookie is available for all paths
    },
    name: 'rateon.sid' // Custom session cookie name
}));

app.use(passportConfig.initialize());
app.use(passportConfig.session());

app.get("/", (req, res) => {
    try {
        return responseHandler.success(res, "Server is running successfully");
    } catch (error) {
        return responseHandler.error(res, error?.message);
    }
});

app.use("/api/v1/", routes);

app.use((req, res) => {
    return responseHandler.error(res, "Route not found");
});

const startServer = async () => {
    try {
        await connectDB();
        await initializeDatabase();
        
        // Initialize WebSocket
        initializeSocket(server);

        // Run orphan cleanup immediately, then every 24h
        await cleanupOrphanedData();
        startCleanupScheduler();
        
        server.listen(PORT, () => {
            console.log(`✅ Server Running: ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Server Failed');
        process.exit(1);
    }
};

startServer();
