const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: chema.Types.ObjectId, ref: "Comment" }],
}, { timestamps: true });

const Post = mongoose.model("posts", postSchema);
module.exports = Post;