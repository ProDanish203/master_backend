import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUpload.js";
import jwt from "jsonwebtoken";

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

        res.status(201).json({
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

        res.status(200)
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
          $set: {
            refreshToken: undefined
          }  
        }, {
            new: true
        })

        // Cookies options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        res.status(200)
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

        res.status(200)
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