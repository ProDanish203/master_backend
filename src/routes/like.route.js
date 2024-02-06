import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();
router.use(verifyAuth);

router.post("/video/:id", toggleVideoLike);
router.post("/comment/:id", toggleCommentLike);

router.get("/video", getLikedVideos);

export default router;