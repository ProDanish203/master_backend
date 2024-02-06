import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";


export const toggleSubscription = async (req, res, next) => {
    try{
        const { channelId } = req.params;  
        if(!channelId || !isValidObjectId(channelId)) return next("Channel Id is required");

        const channel = await User.findById(channelId);
        if(!channel) return next("Channel does not exists");

        const isAlreadySubscribed = await Subscription.find({
            subscriber: req.user?._id,
            channel: channel._id
        });
        
        if(isAlreadySubscribed.length == 0){
            const subscribe = await Subscription.create({
                subscriber: req.user?._id,
                channel: channel._id,
            })
            if(!subscribe) return next("Error occured while subscribing");
            return res.status(200).json({
                success: true,
                data: {},
                message: "Subscription added"
            })
        }else{
            const removeSub = await Subscription.findOneAndDelete(isAlreadySubscribed[0]._id)
            if(!removeSub) return next("Error occured in removing subscribtion");
            return res.status(200).json({
                success: true,
                data: {},
                message: "Subscription removed"
            })
        }
    }catch(error){
        next(error);
    }
}

// to return user's subscribed channels
export const getSubscribedChannels = async (req, res, next) => {
    try{
        const { channelId } = req.params;  
        if(!channelId || !isValidObjectId(channelId)) return next("Channel Id is required");

        const user = await User.findById(channelId);
        if(!user) return next("Channel does not exists");

        const subsTo = await Subscription.aggregate([
            {
                $match: {
                    subscriber: user._id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "subscribedTo",
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
            {
                $addFields: {
                    subscribedTo: {
                        $first: "$subscribedTo"
                    }
                }
            },
            {
                $project: {
                    subscribedTo: 1
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$subscribedTo"
                }
            }
        ])

        if(subsTo.length == 0) return next("No subscribed channels found")

        return res.status(200).json({
            success: true, 
            data: subsTo, 
            message: "Subscribed channels fethed successfully"
        })
    }catch(error){
        next(error);
    }
}

// to return the subscriber list of a channel
export const getUserChannelSubscribers = async (req, res, next) => {
    try{
        const { channelId } = req.params;  

        const channel = await User.findById(channelId);
        if(!channel) return next("Channel does not exists");

        const subs = await Subscription.aggregate([
            {
                $match: {
                    channel: channel._id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subs",
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
            {
                $addFields: {
                    subs: {
                        $first: "$subs"
                    }  
                }
            },
            {
                $project: {
                    subs: 1
                }
            }
        ])

        if(subs.length == 0) return next("No subscibers found")

        res.status(200).json({
            success: true,
            data: subs,
            message: "Subscribers fetched successfully"
        })

    }catch(error){
        next(error);
    }
}