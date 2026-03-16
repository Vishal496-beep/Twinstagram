import { Router } from 'express';
import { 
    toggleFollow, 
    getUserChannelFollowers, 
    getFollowingChannels,
    getSuggestedUsers
} from "../controllers/follow.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Saare routes ko protect karne ke liye
router.use(verifyJWT); 

// Toggle follow/unfollow using profileId
router.route("/c/:profileId").post(toggleFollow);

// Kisi channel ke followers dekhne ke liye
router.route("/followers/:profileId").get(getUserChannelFollowers);

// Ek user kis-kis ko follow kar raha hai wo dekhne ke liye
router.route("/following/:followerId").get(getFollowingChannels);
// Add this line below your other routes
router.route("/suggestions").get(getSuggestedUsers);

export default router;