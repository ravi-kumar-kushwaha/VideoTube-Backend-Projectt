import asynchHandler from "../utils/asynchHandlers.js"
import jwt from "jsonwebtoken";
import User from "../models/user.models.js"
import apiError from "../utils/apiError.js";
import {uploadOnCloudinary, detefromCloudinary} from "../utils/cloiudnary.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new apiError(404,"User not found");
        }
        const accessToken = user.generateJwtToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new apiError(500,"Something went wrong while generating access and refresh token");
    }
}



//register user
const registerUser = asynchHandler(async(req,res)=>{
    const {userName,fullName,email,password} = req.body;
    //Validation
    if([userName,fullName,email,password].some(value=>value?.trim() === "")){
        throw new apiError(400,"All fields are required")
    }
    // Check if username is null or empty
  if (!userName || userName?.trim() === "") {
    throw new apiError(400, "Username is required");
  }
    //check user exists or not
    const user = await User.findOne({
        $or:[{userName:userName.toLowerCase().trim()},{email}]
    });
    if(user){
        // console.log("user already exists",user);
        throw new apiError(409,"User With Username or Email already exists")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path; 
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is missing")
    }
    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // let coverImage = " ";
    // if(coverImageLocalPath){
    //     coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // }
    let avatar ;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        // console.log("uploaded avatar to cloudinary",avatar);
    } catch (error) {
        // console.log("error on cloudinary:", error);
        throw new apiError(500,"Failed to upload avatar");
    }
    let coverImage ;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        // console.log("uploaded coverImage to cloudinary",coverImage);
    } catch (error) {
        // console.log("error on cloudinary:", error);
        throw new apiError(500,"Failed to upload coverImage");
    }
    try {
        const newUser = await User.create({
            userName: userName.toLowerCase().trim(),
            fullName,
            email,
            password,
            avatar: avatar.url ,
            coverImage: coverImage?.url ||" "
        })
        await newUser.save();
        const createdUser  = await User.findById(newUser._id).select("-password -refreshToken");
        // console.log("user created successfully",createdUser);
        if(!createdUser){
            throw new apiError(500,"Something went wrong while creating user")
        }
        return res
        .status(201)
        .json(new apiResponse(200,"User Created Successfully",createdUser))
    } catch (error) {
        // console.log("user creation failed:", error);
        if(avatar){
            await detefromCloudinary(avatar.public_id);
        }
        if(coverImage){
            await detefromCloudinary(coverImage.public_id);
        }
        throw new apiError(500,"Something went wrong while creating user and deleting avatar and coverImage")
    }
})



//login user
const loginUser = asynchHandler(async(req,res)=>{
    const {userName,email,password} = req.body;
    //Validation
    if(!userName || !email|| !password){
        throw new apiError(400,"All fields are required")
    }
    //check user exists or not
    const user = await User.findOne({
        $or:[{userName:userName.toLowerCase().trim()},{email}]
    })
    if(!user){
        throw new apiError(404,"User not found")
    }
    //check password is correct or not
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new apiError(401,"Password is incorrect")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    if(!loggedInUser){
        throw new apiError(500,"Something went wrong while logging in user");
    }
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
    return res
    .status(200)
    .cookie("refreshToken",refreshToken, options)
    .cookie("accessToken",accessToken, options)
    .json(new apiResponse(200,"User Logged In Successfully",{
        user: loggedInUser,
        accessToken,
        refreshToken
    }))
})


//logout user
const logoutUser = asynchHandler(async(req,res)=>{
    const user = User.findById(req.user._id,{
       $set:{ refreshToken: undefined}
    },{new: true});
    const options = {
        httpOnly:true,
        secure:process.env.NODE_ENV === "production"
    }
return res
.status(200)
.clearCookie("refreshToken",options)
.clearCookie("accessToken",options)
.json(new apiResponse(200,{},"User Logged Out Successfully"))
})




//refresh access token
const refreshAccessToken = asynchHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new apiError(401,"Refresh Token is required")
    }
    try {
       const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_JWT_SECRET_KEY);
       const user = await User.findById(decodedToken.id);
       if(!user){
           throw new apiError(401,"Invalid refresh token");
       }
       if(incomingRefreshToken !== user.refreshToken){
           throw new apiError(401,"Invalid refresh token or token expired");
       }
       const options = {
           httpOnly: true,
           secure: process.env.NODE_ENV === "production",
       }

       const {accessToken,refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);
       return res.status(200)
       .cookie("refreshToken",newRefreshToken, options)
       .cookie("accessToken",accessToken, options)
       .json(new apiResponse(200,"Access Token Refreshed Successfully",{
           accessToken,
           refreshToken: newRefreshToken
       }))
    } catch (error) {
        throw new apiError(500,"Something went wrong while refreshing access token");
    }
})

//change current password
const changePassword = asynchHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    const user = await user.findById(req.user?._id);
    if(!user){
        throw new apiError(404,"User not found");
    }
    const isValidPassword = await user.isPasswordCorrect(oldPassword);
    if(!isValidPassword){
        throw new apiError(401,"Old password is incorrect");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(new apiResponse(200,"Password Changed Successfully"))
})



//get current user
const getCurrentUser = asynchHandler(async(req,res)=>{
    if(!req.user){
        throw new apiError(404,"Current Details User not found");
    }
    return res
    .status(200)
    .json(new apiResponse(200,"Current User Details",{currentUser:req.user}))
})



//apdateaccount detail
const updateAccountDetails = asynchHandler(async(req,res)=>{
    const {userName,fullName,email} = req.body;
    if(!userName || !fullName || !email){
    throw new apiError(400,"Username fullName and email fields are required");
    }
    // Check if username or email is already taken
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
    _id: { $ne: req.user._id },
  });
  if (existingUser) {
    throw new apiError(409, "Username or email is already taken by another user.please choose a different one");
  }
    const updatedUser = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            userName,
            fullName,
            email
        }
    },{new: true}).select("-password -refreshToken");
    if(!updatedUser){
        throw new apiError(404,"User not found");
    }
    return res
    .status(200)
    .json(new apiResponse(200,"Account Details Updated Successfully",{user:updatedUser}))
})



//update user avatar
const updateUserAvatar = asynchHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new apiError(500,"Something went wrong while uploading avatar");
    }
   const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
       avatar:avatar.url}
    },{new : true});
  return res
  .status(200)
  .json(new apiResponse(200,"Avatar Updated Successfully",{avatar:avatar.url},{user}))
})



//update user cover image
const updateUserCoverImage = asynchHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new apiError(400,"coverImage file is missing");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
      throw new apiError(500,"something went wrong while uploading coverImage");
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage : coverImage
        }
    },{new : true}).select(-password -refreshToken);
    return res
    .status(200).json(new apiResponse(200,"CoverImage Updated Successfully",{coverImage:coverImage.url},{user}));
});



//get user channel profile
const getUserChannelProfile = asynchHandler(async(req,res)=>{
    const {userName} = req.params;
    if(!userName?.trim()){
        throw new apiError(400,"userName is required");
    }
    const channel = await User.aggregate(
        [
            {
               $match:{
                   userName : userName?.toLowerCase().trim()
               } 
            },{ 
               $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
               }
            },{
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {$size: "$subscribers"},
                    subscribedToCount: {$size: "$subscribedTo"},
                    isSubscribed: {
                       $cond: {
                        if :{
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                       }
                    }
                }
            },
            {
                //project only the necessary data
                $project: {
                    userName: 1,
                    fullName: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1
                }
            }
        ]
        )
        if(!channel?.length){
            throw new apiError(404,"Channel not found");
        }
        return res
        .status(200)
        .json(new apiResponse(200,"Channel Profile",{channel:channel[0]}))
})


//get user watch history
const getUserWatchHistory = asynchHandler(async(req,res)=>{
    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },{
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            userName: 1,
                                            fullName: 1,
                                            avatar: 1
                                        }
                                    },
                                    
                                ]
                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    );
    return res
    .status(200)
    .json(new apiResponse(200,"Watch History fetched successfully",{watchHistory:user[0]?.watchHistory}))
})
export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory
}
