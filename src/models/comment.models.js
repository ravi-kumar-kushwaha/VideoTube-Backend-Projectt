import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose";
const  commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
    // replyTo: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Comment",
    // },
},{timestamps: true})
commentSchema.plugin(mongooseAggregatePaginate);
const Comment = mongoose.model("Comment", commentSchema);
export default Comment