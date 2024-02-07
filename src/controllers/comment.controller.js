import { isValidObjectId } from "mongoose";



export const getVideoComments = async (req, res, next) => {
    try{
        const { videoId } = req.params
        if(!videoId || !isValidObjectId(videoId)) return next("Video Id is required");

    }catch(error){  
        next(error);
    }
}

export const addComment = async (req, res, next) => {
    try{
        const { videoId } = req.params
        if(!videoId || !isValidObjectId(videoId)) return next("Video Id is required");

    }catch(error){  
        next(error);
    }
}


export const updateComment = async (req, res, next) => {
    try{
        const { commentId } = req.params
        if(!commentId || !isValidObjectId(commentId)) return next("Comment Id is required");

    }catch(error){  
        next(error);
    }
}


export const deleteComment = async (req, res, next) => {
    try{
        const { commentId } = req.params
        if(!commentId || !isValidObjectId(commentId)) return next("Comment Id is required");

    }catch(error){  
        next(error);
    }
}