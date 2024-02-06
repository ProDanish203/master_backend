import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadFile } from "../utils/fileUpload.js";

export const publishVideo = async (req, res, next) => {
    try{

        const { title, description } = req.body;

        if(!title) return next("Video title is required");
        if(!description) return next("Video description is required");

        const videoLocalPath = req.files?.videoFile?.[0].path;
        const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

        if(!videoLocalPath) return next("Video is required");
        if(!thumbnailLocalPath) return next("Thumbnail is required");

        const videoFile = await uploadFile(videoLocalPath);
        const thumbnail = await uploadFile(thumbnailLocalPath);

        if(!videoFile) return next("An error occured while uploading the video");
        if(!thumbnail) return next("An error occured while uploading the thumbnail");

        const video = await Video.create({
            videoFile: videoFile.secure_url,
            thumbnail: thumbnail.secure_url, 
            title, description,
            duration: videoFile.duration,
            owner: req.user?._id
        })

        if(!video) return next("An error occured while publishing the video");

        return res.status(200).json({
            success: true,
            data: video,
            message: "Video published"
        })
    }catch(error){
        next(error);
    }
}

export const getVideo = async (req, res, next) => {
    try{
        const { videoId } = req.params;

        const video = await Video.findById(videoId); 
        if(!video) return next("Video does not exists");
        
        const videoData = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(video._id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                fullName: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    }
                }
            },
        ])

        return res.status(200).json({
            success: true,
            data: videoData,
            message: "Video fetched successfully"
        })
    }catch(error){
        next(error);
    }
}


export const getAllVideos = async (req, res, next) => {
    try{

        let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

        page = isNaN(page) ? 1 : Number(page);
        page = isNaN(limit) ? 10 : Number(limit);

        if(page < 0) page = 1;
        if(limit <= 0) limit = 10;

        const matchstage = {};

        const sortStage = {};
        if(sortBy && sortType){
            sortStage["$sort"] = {
                [sortBy]: sortType === "asc" ? 1 : -1,
            }
        }else{
            sortStage["$stage"] = {
                createfAt: -1
            }
        }

        if(userId && isValidObjectId(userId)){

        }

        const skipStage = { $skip: (page - 1) * limit };
        const limitStage = { $limit: limit };

        const videos = await Video.aggregate({
            
        })

        return res.status(200).json({
            success: true,
            data: {},
            message: ""
        })
    }catch(error){
        next(error);
    }
}


export const deleteVideo = async (req, res, next) => {
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


export const updateVideo = async (req, res, next) => {
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

export const togglePublishStatus = async (req, res, next) => {
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