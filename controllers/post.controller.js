const User = require("../models/user.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const newNotification = require("./notification.controller");

const createPost = async(req, res) => {
    const { author, content } = req.body;
    try {
        const user = await User.findById(author);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        let newPost = Post({ author: author, content: content });
        await newPost.save();
        return res.status(200).json({
            success: true,
            message: "post created",
            post: {
                ...newPost._doc,
                authorName: user.name,
                authorUsername: user.username,
            }

        });
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
        await
        const post = await Post.findById(postId)
        if (!post) {
            return res.json({ success: false, message: "User not found" })
        }
        await newNotification(post.author, user._id, "LIKED", postId);
        post.likes.push(user._id);
        await post.save();
        return res.status(200).json({ success: true, message: "post liked", postId: post._id, likdBy: { _id: user._id, name: user.name, username: user.username } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const unlikePost = async(req, res) => {
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

const commentPost = async(req, res) => {
    const { userId, postId, comment } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.json({ success: false, massage: "User not found" });
        }
        let newComment = new Comment({
            comment: comment,
            commentBy: user._id,
            postId: post._id,
        });
        await newComment.save();
        post.comments.push(newComment._id);
        await post.save();
        await newNotification(post.author, user._id, "NEW_COMMENT", postId);
        return res.status(200).json({
            success: true,
            message: "comment added",
            comment: comment
        });
    } catch (error) {
        return res.status(500).json({ success: true, message: error.message });
    }
}

const deletePost = async(req, res) => {
    try {
        const postId = req.params.postId;
        await Post.findByIdAndDelete(postId);
        return res
            .status(200)
            .json({ success: true, message: "post deleted", PostId: postId });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const fetchLikes = async(req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            return res.json({
                success: false,
                message: "Invalid Id, post not found",
            });
        }
        const likes = await User.find({ _id: { $in: post.likes } },
            "_id name username"
        );
        return res.status(200).json({ success: true, likes: likes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const fetchComments = async(req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            return res.json({
                success: false,
                message: "Invalid Id, post not found",
            });
        }
        const comments = await Comment.find({ postId: post._id });
        return res.status(200).json({ success: true, comments: comments });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updatePost = async(req, res) => {
    try {
        const { postId, content } = req.body;
        const post = await Post.findById(postId);
        const user = await User.findById(post.author);
        post.content = content;
        return res.status(200).json({
            success: true,
            message: "requested post fetched",
            post: {
                ...post._doc,
                authorName: user.name,
                authorUsername: user.username,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });

    }
}

const fetchSinglePage = async(req, res) => {
    try {
        const posstId = req.params.postId;
        const post = await Post.findById(postId);
        const user = await User.findById(post.author);
        return res.status(200).json({
            success: true,
            message: "requested post fetched",
            post: {
                ...post._doc,
                authorName: user.name,
                authorUsername: user.username,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deletComment = async(req, res) => {
    // here write code 
}


module.exports = { fetchLikes, fetchSinglePage, deletComment, deletePost, createPost, likePost, unlikePost, commentPost, fetchComments, updatePost };