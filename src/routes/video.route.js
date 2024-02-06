import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideo, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router = Router();
router.use(verifyAuth);

router.post("/publish", upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    },
]), publishVideo);


router.get("/", getAllVideos);

router.get("/:videoId", getVideo);

router.delete("/delete/:videoId", deleteVideo);
router.put("/update/:videoId", upload.single("thumbnail") ,updateVideo);

router.put("/toggle/publish/:videoId", togglePublishStatus);


export default router;