import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage, updateUserDetails } from "../controllers/user.controller.js";
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

router.put("/change-password", verifyAuth, changeCurrentPassword)

router.get("/current-user", verifyAuth, getCurrentUser)

router.put("/update-profile", verifyAuth, updateUserDetails)

router.put("/update-avatar", upload.single ,verifyAuth, updateUserAvatar)

router.put("/update-cover", upload.single ,verifyAuth, updateUserCoverImage)




export default router;