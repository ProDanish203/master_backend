import { Schema, model } from "mongoose"

const playlistSchema = new Schema({
    name: {
        type: String,
        required: [true, "Playlist name is required"]
    },
    desc: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
}, 
{ timestamps: true });

export const Playlist = model("Playlist", playlistSchema);