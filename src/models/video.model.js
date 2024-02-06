import { Schema, model } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        public_id: {
            type: String,
            required: [true, "Video public_id is required"]
        },
        url: {
            type: String,
            required: [true, "Video secure_url is required"]
        }
    },
    thumbnail: {
        public_id: {
            type: String,
            required: [true, "Thumbnail public_id is required"]
        },
        url: {
            type: String,
            required: [true, "Thumbnail secure_url is required"]
        }
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    description: {
        type: String,
        required: [true, "Decription is required"]
    },
    duration: Number,
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, 
{ timestamps: true });


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video", videoSchema);