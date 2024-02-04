import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUpload.js";

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
        const avatarLocalPath = req.files?.avatar[0]?.path;
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