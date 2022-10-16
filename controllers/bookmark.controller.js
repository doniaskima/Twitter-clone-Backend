const bookmarkModels = require("../models/bookmark.models");
const mongoose = require("mongoose");


const bookmarkPost = async(req, res) => {
    try {
        let isPostBookmarked = null;
        isPostBookmarked = await bookmarkModels.findOne({
            post: req.post._id,
            user: req.verifiedUser._id,
        });
        if (!isPostBookmarked) {
            isPostBookmarked = new bookmarkModels({
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


const unbookmarkPost = async(req, res) => {
    try {
        await bookmarkModels.deleteOne({
            user: req.verifiedUser._id,
            post: req.post._id,
        });
        return res.status(204).json();

    } catch (err) {
        return res.status(500).json(err);
    }
}






module.exports.bookmarkPost = bookmarkPost;
module.exports.unbookmarkPost = unbookmarkPost;