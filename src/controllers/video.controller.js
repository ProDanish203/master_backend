import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { deleteFile, uploadFile } from "../utils/fileUpload.js";

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
            videoFile: { public_id: videoFile.public_id, url: videoFile.secure_url},
            thumbnail: { public_id: thumbnail.public_id, url: thumbnail.secure_url}, 
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

        page = isNaN(page) ? 1 : parseInt(page);
        limit = isNaN(limit) ? 10 : parseInt(limit);

        if(page < 0) page = 1;
        if(limit <= 0) limit = 10;


        const matchStage = {};
        if(userId && isValidObjectId(userId)){
            matchStage["$match"] = {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }else if(query){
            matchStage["$match"] = {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        }else{
            matchStage["$match"] = {}
        }


        if(userId && query){
            matchStage["$match"] = {
                $and: [
                    { owner: new mongoose.Types.ObjectId(userId) },
                    { 
                        $or: [
                            { title: { $regex: query, $options: "i" } },
                            { description: { $regex: query, $options: "i" } }
                        ]
                    }
                ]
            }
        }

        const sortStage = {};
        if(sortBy && sortType){
            sortStage["$sort"] = {
                [sortBy]: sortType === "asc" ? 1 : -1,
            }
        }else{
            sortStage["$sort"] = {
                createdAt: -1
            }
        }

        const skipStage = { $skip: (page - 1) * limit };
        const limitStage = { $limit: limit };

        const videos = await Video.aggregate([
            matchStage,
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                username: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            // {       //For Likes
            //     $lookup: {
            //         from: "",
            //         localField: "",
            //         foreignField: "",
            //         as: ""
            //     }
            // }
            sortStage,
            skipStage,
            limitStage,
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    },
                    // likes: {
                    //     $size: "$likes"
                    // },
                }
            }
        ])

        return res.status(200).json({
            success: true,
            data: videos,
            message: ""
        })
    }catch(error){
        next(error);
    }
}


export const deleteVideo = async (req, res, next) => {
    try{
        const { videoId } = req.params;

        if(!videoId || !isValidObjectId(videoId)) return next("Video id is required")

        const video = await Video.findById(videoId);

        if(video.owner.toString() != (req.user?._id).toString()) return next("Unauthorized access");

        const deleteVid = await Video.findByIdAndDelete(video._id);
        if(!deleteVid) return next("An error occured while deleting the video");

        await deleteFile(video.videoFile.public_id);
        await deleteFile(video.thumbnail.public_id);

        // TODO: delete all the comments and likes documents


        return res.status(200).json({
            success: true,
            data: {},
            message: "Video deleted successfully"
        })
    }catch(error){
        next(error);
    }
}


export const updateVideo = async (req, res, next) => {
    try{
        const { videoId } = req.params;
        
        if(!videoId || !isValidObjectId(videoId)) return next("Video id is required")

        const {title, description} = req.body;
        if(!title) return next("Video title is required"); 
        if(!description) return next("Video description is required"); 

        const videoCheck =  await Video.findById(videoId); 
        if(!videoCheck) return next("Video does not exists");

        if(videoCheck.owner.toString() != (req.user?._id).toString()){
            return next("Unauthorized access");
        }

        const thumbnailLocalPath = req.file?.path;
        let thumbnail;
        if(thumbnailLocalPath){
            thumbnail = await uploadFile(thumbnailLocalPath);
            if(!thumbnail.url) {
                return next("Failed to upload thumbnail");
            }
        }

        const video = await Video.findById(videoId); //will come into work when deleting the current thumbnail picture on cloudinary

        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
            $set: {
                title,
                description,
                ...(thumbnail && thumbnail.secure_url && { thumbnail: {public_id: thumbnail.public_id, url: thumbnail.secure_url} })
            }
        }, { new: true });

        await deleteFile(video.thumbnail.public_id);

        return res.status(200).json({
            success: true,
            data: updatedVideo,
            message: "Video updated successfully"
        })
    }catch(error){
        next(error);
    }
}

export const togglePublishStatus = async (req, res, next) => {
    try{

        const { videoId } = req.params;
        if(!videoId || !isValidObjectId(videoId)) return next("Video id is required")

        const video = await Video.findById(videoId);
        if(!video) return next("Video does not exists");
        
        if(video.owner.toString() != (req.user?._id).toString()){
            return next("Unauthorized access");
        }   

        video.isPublished = !(video.isPublished);
        await video.save();

        return res.status(200).json({
            success: true,
            data: {},
            message: "Toggle publish state"
        })
    }catch(error){
        next(error);
    }
}