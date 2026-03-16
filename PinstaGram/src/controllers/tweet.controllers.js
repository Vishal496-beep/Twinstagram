import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

import { uploadOnCloudinary } from "../utils/cloudinary.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    
    // req.files is used for upload.fields
    const imageLocalPath = req.files?.image?.[0]?.path;
    const videoLocalPath = req.files?.video?.[0]?.path;

    if (!content && !imageLocalPath) {
        throw new ApiError(400, "Content or Image is required");
    }

    let imageUrl = "";
    if (imageLocalPath) {
        const result = await uploadOnCloudinary(imageLocalPath);
        imageUrl = result?.url || "";
    }

    const tweet = await Tweet.create({
        content,
        image: imageUrl, // Ensure "image" is in your Tweet Schema
        owner: req.user?._id
    });

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created"));
});

// ... inside tweet.controllers.js
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user Id");

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [{
                    $project: { username: 1, avatar: 1, fullname: 1 }
                }]
            }
        },
        // LOOKUP FOR LIKES
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                ownerDetails: { $first: "$ownerDetails" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched"));
});
const getAllTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.aggregate([
        {
            // Optional: You could use $match here to filter out blocked users 
            // or just leave it empty to get EVERYONE'S tweets.
            $match: {} 
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [{
                    $project: { username: 1, avatar: 1, fullname: 1 }
                }]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                ownerDetails: { $first: "$ownerDetails" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, tweets, "All tweets fetched"));
});
const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    if (!content || content.trim()==="") {
        throw new ApiError(400, "content is required")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet Id")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "tweet not found")
    }
   if (tweet?.owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "Unauthorized: You cannot update this tweet");
    }
    tweet.content = content
    tweet.save()
    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"))
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

      if (tweet?.owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "Unauthorized: You cannot update this tweet");
    }
    await Tweet.findByIdAndDelete(tweetId)
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"))
})
const getTrendingHashtags = asyncHandler(async (req, res) => {
    const trending = await Tweet.aggregate([
        // 1. Get all tweet content
        { $project: { content: 1 } },
        // 2. Split content into words (regex handles spaces and newlines)
        { $project: { words: { $split: ["$content", " "] } } },
        // 3. Turn the array of words into individual documents
        { $unwind: "$words" },
        // 4. Filter only words starting with #
        { $match: { words: { $regex: /^#/ } } },
        // 5. Group by the word and count occurrences
        {
            $group: {
                _id: "$words",
                count: { $sum: 1 }
            }
        },
        // 6. Sort by highest count and limit to top 5
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    return res.status(200).json(new ApiResponse(200, trending, "Trending tags fetched"));
});

// GET /api/tweet/feed
 const getTimelineTweets = asyncHandler(async (req, res) => {
    // 1. Find who the user follows
    const following = await Follower.find({ follower: req.user._id });
    const followingIds = following.map(f => f.following);

    // 2. Get tweets from those IDs + user's own ID
    const tweets = await Tweet.find({
        owner: { $in: [...followingIds, req.user._id] }
    })
    .sort({ createdAt: -1 })
    .populate("owner", "username avatar fullname");

    return res.status(200).json(new ApiResponse(200, tweets, "Timeline fetched"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets,
    getTrendingHashtags,
    getTimelineTweets
}