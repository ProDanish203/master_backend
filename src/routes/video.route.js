import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { getAllVideos, getVideo, publishVideo, togglePublishStatus } from "../controllers/video.controller.js";

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

router.delete("/delete/:videoId", getVideo);
router.put("/update/:videoId", getVideo);

router.put("/toggle/publish/:videoId", togglePublishStatus);


export default router;