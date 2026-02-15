import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../../config/config.js';

let io = null;
const connectedUsers = new Map(); // userId -> socketId mapping

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 */
export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:5300', 'http://127.0.0.1:5300', 'https://rateon.vercel.app', FRONTEND_URL],
            credentials: true,
            methods: ['GET', 'POST']
        },
        path: '/socket.io/',
        transports: ['websocket', 'polling']
    });

    // Authentication middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.id;
            socket.userType = decoded.userType || 'user';
            next();
        } catch (error) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        // Join user to their personal room
        socket.join(`user:${userId}`);
        connectedUsers.set(userId, socket.id);

        // Send connection success event
        socket.emit('connected', {
            message: 'Connected to notification service',
            userId
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            connectedUsers.delete(userId);
        });

        // Handle errors
        socket.on('error', (error) => {
        });
    });
    return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket first.');
    }
    return io;
};

/**
 * Emit notification to specific user
 * @param {String} userId - Target user ID
 * @param {Object} notification - Notification data
 */
export const emitNotificationToUser = (userId, notification) => {
    try {
        if (!io) {
            return false;
        }

        // Emit to user's personal room
        io.to(`user:${userId}`).emit('new_notification', notification);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Emit unread count update to user
 * @param {String} userId - Target user ID
 * @param {Number} unreadCount - New unread count
 */
export const emitUnreadCountUpdate = (userId, unreadCount) => {
    try {
        if (!io) {
            return false;
        }

        io.to(`user:${userId}`).emit('unread_count_update', { unreadCount });
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Check if user is connected
 * @param {String} userId - User ID
 */
export const isUserConnected = (userId) => {
    return connectedUsers.has(userId);
};

/**
 * Get total connected users count
 */
export const getConnectedUsersCount = () => {
    return connectedUsers.size;
};

export default {
    initializeSocket,
    getIO,
    emitNotificationToUser,
    emitUnreadCountUpdate,
    isUserConnected,
    getConnectedUsersCount
};
