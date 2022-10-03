const postModels = require("../models/post.models");

const createPost = async(req, res) => {
    const newPost = new postModels({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: req.body.avatar,
        email: req.body.email,
        password: req.body.password,
    });

    try {
        const savedPost = await newPost.save();
        return res.status(201).json(savedPost);
    } catch (err) {
        return res.status(500).json(err);
    }
};
const getPosts = async(req, res) => {
    try {
        const posts = await postModels.find();
        return res.status(200).json(posts);
    } catch (err) {
        return res.status(500).json(err);
    }
};
const getPost = async(req, res) => {
    const post = req.post;
    try {
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json(err);
    }
};

const deletePost = async(req, res) => {
    const id = req.post._id;
    try {
        const post = await postModels.findByIdAndDelete(id);
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json(err);
    }
};
const updatePost = async(req, res) => {
    const id = req.post._id;
    try {
        const post = await postModels.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports.getPost = getPost;
module.exports.getPosts = getPosts;
module.exports.updatePost = updatePost;
module.exports.deletePost = deletePost;
module.exports.createPost = createPost;