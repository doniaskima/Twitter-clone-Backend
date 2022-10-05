const { Notification } = require("../models/notification.model");
const { User } = require("../models/user.model");

const newNotification = async(targetId, sourceId, type, postId) => {
    try {
        const notification = new Notification({
            targetId: targetId,
            sourceId: sourceId,
            isRead: false,
            type: type,
            postId: postId,
        });
        await notification.save();
    } catch (error) {
        console.log(error);
    }
}

const fetchUserNotifications = async(req, res) => {
    try {
        const userId = req.params.userId;
        const user = User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "invalid id, user not found" });
        }

    }
}

module.exports = { newNotification, fetchUserNotifications };