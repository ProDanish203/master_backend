import { Schema, model} from "mongoose"
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

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
        type: String,
        required: [true, "Avatar is required"]
    },
    coverImage: {
        type: String,
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

    this.password = bcrypt.hash(this.password, 10);
    next();
})


userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

export const User = model("User", userSchema);
