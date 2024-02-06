import { Schema, model } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
}, 
{ timestamps: true });


commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = model("Comment", commentSchema);