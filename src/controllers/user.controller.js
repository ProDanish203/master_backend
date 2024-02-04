import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUpload.js";

export const registerUser = asyncHandler(async (req, res) => {

    // Get data from frontednd
    const {fullName, username, email, password} = req.body

    // Perform Validation
    if(!fullName) throw new ApiError(400, "full name is required")
    if(!username) throw new ApiError(400, "Username is required")
    if(!email) throw new ApiError(400, "Email address is required")
    if(!password) throw new ApiError(400, "Password is required")
    if(password.includes(" ")) throw new ApiError(400, "Password must not contain any white spaces")

    // Check if user already exists
    const userExists = await User.findOne({
        $or: [{username}, {email}]
    })

    if(userExists) throw new ApiError(409, "User already exists")

    // Check for images, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath) throw new ApiError(400, "Avatar is required")

    // Upload images on cloudinary
    const avatar = await uploadFile(avatarLocalPath)
    const coverImage = coverImageLocalPath && await uploadFile(coverImageLocalPath)

    if(!avatar) throw new ApiError(409, "Avatar is required")

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
        throw new ApiError(500, "An error occured while registering user");
    }
    // Send response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})