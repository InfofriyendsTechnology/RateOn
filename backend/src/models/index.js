export { default as Admin } from './AdminModel.js';
export { default as User } from './UserModel.js';
export { default as Business } from './BusinessModel.js';
export { default as Item } from './ItemModel.js';
export { default as Category } from './CategoryModel.js';
export { default as Review } from './ReviewModel.js';
export { default as Reaction } from './ReactionModel.js';
export { default as Reply } from './ReplyModel.js';
export { default as Follow } from './FollowModel.js';
export { default as ActivityLog } from './ActivityLogModel.js';
export { default as Report } from './ReportModel.js';
import { initializeAdmin } from './AdminModel.js';

// Initialize all default data
export const initializeDatabase = async () => {
    try {
        await initializeAdmin();
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
};
