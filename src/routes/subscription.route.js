import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyAuth);


router.post('/toggle/:channelId', toggleSubscription)
router.get('/u/:channelId', getSubscribedChannels)

router.get('/c/:channelId', getUserChannelSubscribers)


export default router;