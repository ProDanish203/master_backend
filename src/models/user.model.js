import { Schema, model} from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already taken"],
        trim: true,
        index: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [true, "Password must be greater than 6 charcters"],
    },
    email: {
        type: String,
        required: [true, "Email address is required"],
        unique: [true, "Email address already in use"],
        validate: validator.isEmail,
        trim: true,
        lowercase:true
    },
    isEmailVerfied: {
        type: Boolean,
        default: false
    },
    fullName: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        index: true
    },
    avatar: {
        public_id: {
            type: String,
            required: [true, "Avatar public_id is required"]
        },
        url: {
            type: String,
            required: [true, "Avatar secure_url is required"]
        }
    },
    coverImage: {
        public_id: String,
        url: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken: {
        type: String
    }
},
{ timestamps: true })


userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})


userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.email,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = model("User", userSchema);
