const express = require("express");
const router = express.Router();
const {
    fetchUserNotifications,
} = require("../controllers/notification.controller");
const {
    login,
    searchById,
    signup,
    updateCurrentUserDetails,
    fetchUserPosts,
    searchUser,
    follow,
    getUserChats,
    getUserFeed,
} = require("../controllers/user.controllers");

router.route("/login").post(login);
router.route("/signup").post(signup);
router.route("/follow").post(follow);
router.param("userId", searchById);
router.route("/chats/:userId", getUserChats)
router.route("/get-user-posts/:userId").get(fetchUserPosts);
router.route("/update/:userId").put(updateCurrentUserDetails);
router.route("/notifications/:userId").get(fetchUserNotifications);
router.route("/search").get(searchUser);
router.route("/feed/:userId").get(getUserFeed);
module.exports = router;