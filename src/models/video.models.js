import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose";
const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
    // likes: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // dislikes: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // comments: {
    //     type: Array,
    //     required: true,
    //     default: []
    // },
    // userId: {
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"User",
    //     required: true
    // }
}, { timestamps: true });
videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model("Video", videoSchema);
export default Video