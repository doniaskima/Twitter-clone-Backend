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


module.exports = { createPost };