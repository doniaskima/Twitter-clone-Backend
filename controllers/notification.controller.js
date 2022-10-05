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
const getNotifications = async(req, res) => {
    try {
        const notifications = await notificationModels.find();
        return res.status(200).json(notifications);
    } catch (err) {
        return res.status(500).json(err);
    }
};
const getNotification = async(req, res) => {
    const notification = req.notification;
    try {
        return res.status(200).json(notification);
    } catch (err) {
        return res.status(500).json(err);
    }
};

const deleteNotification = async(req, res) => {
    const id = req.notification._id;
    try {
        const notification = await notificationModels.findByIdAndDelete(id);
        return res.status(200).json(notification);
    } catch (err) {
        return res.status(500).json(err);
    }
};
const updateNotification = async(req, res) => {
    const id = req.notification._id;
    try {
        const notification = await notificationModels.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        return res.status(200).json(notification);
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports = { newNotification };