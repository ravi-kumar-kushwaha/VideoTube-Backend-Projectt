import jwt from "jsonwebtoken";
import apiError from "../utils/apiError.js";
import User from "../models/user.models.js";
import asynchHandler from "../utils/asynchHandlers.js";

const veryfyToken= asynchHandler(async(req,res,next)=>{
    const jwtToken = req.cookies.accessToken || req.header(authorization?.replece("Bearer ",""));
    if(!jwtToken){
        throw new apiError(401,"unauthorized user");
    }

    try {
        const decodedToken = jwt.verify(jwtToken,process.env.JWT_SECRET_KEY);
        const user = await User.findById(decodedToken._id).select("-password,-refreshToken");
        if(!user){
            throw new apiError(401,"unauthorized user");
        }
        req.user = user;
        next();

    } catch (error) {
        throw new apiError(401,error?.message || "Invalid access token");
    }
})

export {veryfyToken}