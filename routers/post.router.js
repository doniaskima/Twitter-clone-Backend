const express = require("express");
const router = express.Router();
const {
    createPost,
    likePost,
    commentPost,
    unlikePost,
    fetchLikes,
    deletePost,
    fetchComments,
} = require("../controllers/post.controller");

router.route("/new").post(createPost);
router.route("/like").post(likePost);
router.route("/comment").post(commentPost);
router.route("/dislike").post(unlikePost);
router.route("/likes/:postId").get(fetchLikes);
router.route("/comments/postId").get(fetchComments);
router.route("delete/:postId").delete(deletePost)