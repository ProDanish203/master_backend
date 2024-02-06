import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage, updateUserDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)

router.post("/login", loginUser)

router.post("/logout", verifyAuth  , logoutUser)

router.post("/refresh-token", refreshAccessToken)

router.patch("/change-password", verifyAuth, changeCurrentPassword)

router.get("/current-user", verifyAuth, getCurrentUser)

router.patch("/update-profile", verifyAuth, updateUserDetails)

router.patch("/update-avatar", verifyAuth, upload.single("avatar") , updateUserAvatar)

router.patch("/update-cover", verifyAuth, upload.single("coverImage") , updateUserCoverImage)

router.get("/c/:username", verifyAuth, getUserChannelProfile);

router.get("/watch-history", verifyAuth, getWatchHistory);


export default router;