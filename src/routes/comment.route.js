import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAuth);

router.get("/:videoId", getVideoComments);
router.post("/:videoId", addComment);

router.patch("/c/:commentId", updateComment);
router.delete("/c/:commentId", deleteComment);


export default router;