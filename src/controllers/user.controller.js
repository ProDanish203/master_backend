// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteFile, uploadFile } from "../utils/fileUpload.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// export const registerUser = asyncHandler(async (req, res, next) => {
    // No need of try catch
    // if(!fullName) throw new ApiError(400, "full name is required")

    // return res.status(201).json(
    //     new ApiResponse(200, createdUser, "User registered successfully")
    // )
// })


export const registerUser = async (req, res, next) => {
    try{
        // Get data from frontend
        const {fullName, username, email, password} = req.body

        // Perform Validation
        if(!fullName) return next("full name is required")
        if(!username) return next("Username is required")
        if(!email) return next("Email address is required")
        if(!password) return next("Password is required")
        if(password.includes(" ")) return next("Password must not contain any white spaces")

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{username}, {email}]
        })

        if (userExists) {
            if (userExists.username === username) {
                return next("Username already exists");
            } else {
                return next("Email already exists");
            }
        }

        // Check for images, avatar
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

        if(!avatarLocalPath) return next("Avatar is required")

        // Upload images on cloudinary
        const avatar = await uploadFile(avatarLocalPath)
        const coverImage = coverImageLocalPath && await uploadFile(coverImageLocalPath)

        if(!avatar) return next("Avatar is required")

        // Create user collecction
        const user = await User.create({
            fullName, username, email, password,  
            avatar: avatar.secure_url, 
            coverImage : coverImage?.secure_url || "",
        })
        // Remove password and refreshToken fields
        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        // Check for user creation
        if(!createdUser){
            return next("An error occured while registering user");
        }
        // Send response

        return res.status(201).json({
            success: true, 
            data: createdUser,
            message: "User registered successfully"
        })

    }catch(error){
        next(error);
    }
}


const generateTokens = async (userId) => {
    try{
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    }catch(error){
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}


export const loginUser = async (req, res, next) => {
    try{
        // Get data from frontend
        const {username, password, email} = req.body;
        
        if(!username && !email) return next("Username or email is required")
        if(!password) return next("Password is required")
        
        // Find User if  it exists
        const user = await User.findOne({
            $or: [{username}, {email}]
        })
        if(!user) return next("Invalid credentials");

        const isPassValid = await user.comparePassword(password)
        if(!isPassValid) return next("Invalid credentials");

        const { accessToken, refreshToken } = await generateTokens(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        // Cookies options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            data: {
                loggedInUser, accessToken, refreshToken
            },
            message: "Login success"
        })
    }catch(error){
        next(error);
        console.log(error)
    }
}


export const logoutUser = async (req, res, next) => {
    try{

        await User.findByIdAndUpdate(req.user._id, 
        {
          $unset: {
            refreshToken: 1 // remove refresh token from the db
          }  
        }, { new: true });

        // Cookies options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            success: true,
            data: {},
            message: "Logged out successfully"
        })

    }catch(error){
        next(error)
        console.log(error)
    }
}


export const refreshAccessToken = async (req, res, next) => {
    try{
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken) return next("Unauthorized request");

        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)
        if(!user) return next("Invalid refresh token");

        if(incomingRefreshToken !== user?.refreshToken) return next("Refresh token is expired or used");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        const { accessToken, refreshToken } = await generateTokens(user._id)

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true, 
            data: {
                accessToken, refreshToken
            },
            message: "Access token refreshed"
        })

    }catch(error){  
        next(error);
        console.log(error)
    }
}


export const changeCurrentPassword = async (req, res, next) => {
    try{
        const { currentPassword, newPassword } = req.body;

        if(!currentPassword) return next("Current password is required")
        if(!newPassword) return next("New password is required")

        const user = await User.findById(req.user?._id);
        if(!user) return next("Authentication error");
        
        const checkPassword = await user.comparePassword(currentPassword);
        if(!checkPassword) return next("Password is incorrect");

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            data: {},
            message: "Password changed successfully"
        });

    }catch(error){  
        next(error);
    }
}


export const getCurrentUser = async (req, res, next) => {
    try{
        return res.status(200).json({
            success: true,
            data: req.user,
            message: "User fecthed successfully"
        });

    }catch(error){
        next(error);
    }
}

export const updateUserDetails = async (req, res, next) => {
    try{
        const {fullName} = req.body;

        if(!fullName) return next("FullName is required");

        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: {
                fullName
            }
        }, { new: true })
        .select("-password -refreshToken");

        return res.status(200).json({
            success: true,
            data: user,
            message: "Profile updated"
        });

    }catch(error){
        next(error);
    }
}


export const updateUserAvatar = async (req, res, next) => {
    try{
        const avatarLocalPath = req.file?.path;
        if(!avatarLocalPath) return next("Avatar is required");

        // Upload on cloudinary
        const avatar = await uploadFile(avatarLocalPath)
        if(!avatar.url) return next("Error while uploading avatar");

        // Delete current avatar
        // const currentAvatar = await deleteFile(req.user?.avatar);
        // if(!currentAvatar) 

        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: {
                avatar: avatar.secure_url
            }
        }, { new: true })
        .select("-password -refreshToken")

        return res.status(200).json({
            success: true,
            data: user,
            message: "Avatar updated"
        })

    }catch(error){
        next(error);
    }
}

export const updateUserCoverImage = async (req, res, next) => {
    try{
        const coverImageLocalPath = req.file?.path;
        if(!coverImageLocalPath) return next("Cover image is required");

        // Upload on cloudinary
        const coverImage = await uploadFile(coverImageLocalPath)
        if(!coverImage.url) return next("Error while uploading cover image");

        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: {
                coverImage: coverImage.secure_url
            }
        }, { new: true })
        .select("-password -refreshToken")

        return res.status(200).json({
            success: true,
            data: user,
            message: "Cover image updated"
        })

    }catch(error){
        next(error);
    }
}


export const getUserChannelProfile = async (req, res, next) => {
    try{
        const {username} = req.params;
        if(!username) return next("Username is required");

        const channel = await User.aggregate([
            {   
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {     // get all the users who are subscribed to this channel
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {     // get all the channels who are subscribed by this user
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {    // count the number of subscribers and subscribeTo
                    subscribersCount: {
                        $size: "$subscribers"   
                    },
                    subscribedToCount: {
                        $size: "$subscribedTo"   
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber" ]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {   // data that will be passed after selecting some fields
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1
                }
            }
        ])

        if(!channel.length) return next("Channel does not exists");

        return res.status(200).json({
            success: true,
            data: channel[0],
            message: "Channel info fetched successfully"
        })
        
    }catch(error){
        next(error);
    }
}



export const getWatchHistory = async (req, res, next) => {
    try{
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [  // populate the owner from user model
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            },
                        },
                        {
                            $addFields: {  // get the first element of the owner array
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                },

            },
        ])

        if(!user.length) return next("User history not found");

        return res.status(200).json({
            success: true,
            data: user[0].watchHistory,
            message: "User watch history fecthed"
        })
    }catch(error){
        next(error);
        console.log(error)
    }
}