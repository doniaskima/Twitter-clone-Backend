const express = require("express");
const router = express.Router();
const {
    createPost,
    likePost,
    commentPost,
    dislikePost,
} = require("../controllers/post.controller");

router.route("/new").post(createPost);
router.route("/like").post(likePost);
router.route("/comment").post(commentPost);
router.route("/dislike").post(dislikePost);