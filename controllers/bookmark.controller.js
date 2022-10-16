const bookmarkModels = require("../models/bookmark.models");
const mongoose = require("mongoose");


const bookmarkPost = async(req, res) => {
    try {
        let isPostBookmarked = null;
        isStoryBookmarked = await bookmarkModels.findOne({
            post: req.post._id,
            user: req.verifiedUser._id,
        });
        if (!isStoryBookmarked) {
            isStoryBookmarked = new bookmarkModels({
                user: req.verifiedUser._id,
                post: req.post._id,
            });
            await isPostBookmarked.save();
        }
        return res.status(201).json({ message: `${res.post.content} bookmarked` })
    } catch (err) {
        return res.status(500).json(err);
    }
}









module.exports.bookmarkPost = bookmarkPost;