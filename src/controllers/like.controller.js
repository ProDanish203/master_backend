import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

export const toggleVideoLike = async (req, res, next) => {
    try{
        const { id } = req.params;
        if(!id || !isValidObjectId(id)) return next("Video id is required");;
        
        const video = await Video.findById(id);
        if(!video) return next("Video does not exists");

        const isAlreadyLiked = await Like.find({
            video: video._id,
            likedBy: req.user?._id
        })

        if(isAlreadyLiked.length == 0){
            const addLike = await Like.create({
                video: video._id,
                likedBy: req.user?._id
            });
            if(!addLike) return next("Error occured while liking the video")
            return res.status(200).json({
                success: true,
                data: {},
                message: "Like added"
            })
        }else{
            const removeLike = await Like.findByIdAndDelete(isAlreadyLiked[0]._id)
            if(!removeLike) return next("Error occured while removing the like from video")
            return res.status(200).json({
                success: true,
                data: {},
                message: "Like removed"
            })
        }
    }catch(error){
        next(error);
    }
}

export const toggleCommentLike = async (req, res, next) => {
    try{
        const { id } = req.params;
        if(!id || !isValidObjectId(id)) return next("Comment id is required");;
        
        const comment = await Comment.findById(id);
        if(!comment) return next("Comment does not exists");

        const isAlreadyLiked = await Like.find({
            comment: comment._id,
            likedBy: req.user?._id
        })

        if(isAlreadyLiked.length == 0){
            const addLike = await Like.create({
                comment: comment._id,
                likedBy: req.user?._id
            });
            if(!addLike) return next("Error occured while liking the comment")
            return res.status(200).json({
                success: true,
                data: {},
                message: "Like added"
            })
        }else{
            const removeLike = await Like.findByIdAndDelete(isAlreadyLiked[0]._id)
            if(!removeLike) return next("Error occured while removing the like from comment")
            return res.status(200).json({
                success: true,
                data: {},
                message: "Like removed"
            })
        }

    }catch(error){
        next(error);
    }
}

// to get all the liked videos of the current user
export const getLikedVideos = async (req, res, next) => {
    try{
        
        

        return res.status(200).json({
            success: true,
            data: {},
            message: ""
        })
    }catch(error){
        next(error);
    }
}