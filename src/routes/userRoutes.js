import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory
 } from "../controllers/user.controller.js";
import { veryfyToken } from "../middlewares/auth.middleware.js";
//register routes
router.post("/register",upload.fields(
    [
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]
),registerUser);
//login routes
router.post("/login",loginUser);
router.post("/refreshToken",refreshAccessToken);
//secured routes
router.post("/logout",veryfyToken,logoutUser);
router.post("/changePassword",veryfyToken,changePassword);
router.get("/getCurrentUser",veryfyToken,getCurrentUser);
router.patch("/updateuserDetails",veryfyToken,updateAccountDetails);
router.patch("/avatar",veryfyToken,upload.single("avatar"),updateUserAvatar);
router.patch("/coverImage",veryfyToken,upload.single("coverImage"),updateUserCoverImage);
router.get("/getUserChannelProfile/:userName",veryfyToken,getUserChannelProfile);
router.get("/getUserWatchHistory",veryfyToken,getUserWatchHistory);
export default router