const { User } = require("../models/user.model");
const { Post } = require("../models/post.model");


const createPost = async(req, res) => {
    const { author, content } = req.body;
    try {
        const user = await User.findById(author);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        let newPost = Post({ author: author, content: content });
        await newPost.save();
        return res.status(200).json({ success: true, message: "post created" });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const likePost = async(req, res) => {
    const { userId, postId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found !" })
        }
        const post = await Post.findById(postId)
        if (!post) {
            return res.json({ success: false, message: "User not found" })
        }
        post.likes.push(user._id);
        await post.save();
        return res.status(200).json({ success: true, message: "post liked" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const dislikePost = async(req, res) => {
    const { userId, postId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, massage: "User not found" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.json({ success: false, massage: "User not found" });
        }
        post.likes.slice(user._id);
        await post.save();
        return res.status(200).json({ success: true, message: "post disliked" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = { createPost, likePost, dislikePost };