import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import businessRoutes from "./businessRoutes.js";
import itemRoutes from "./itemRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import reactionRoutes from "./reactionRoutes.js";
import replyRoutes from "./replyRoutes.js";
import followRoutes from "./followRoutes.js";
import activityRoutes from "./activityRoutes.js";
import leaderboardRoutes from "./leaderboardRoutes.js";
import reportRoutes from "./reportRoutes.js";
import adminRoutes from "./adminRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import locationRoutes from "./locationRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/businesses", businessRoutes);
router.use("/items", itemRoutes);
router.use("/categories", categoryRoutes);
router.use("/reviews", reviewRoutes);
router.use("/reactions", reactionRoutes);
router.use("/replies", replyRoutes);
router.use("/notifications", notificationRoutes);
router.use("/follow", followRoutes);
router.use("/activity", activityRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/reports", reportRoutes);
router.use("/admin", adminRoutes);
router.use("/locations", locationRoutes);

export default router;






