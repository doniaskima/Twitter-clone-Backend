const notificationModels = require("../models/notification.models");

const createNotification = async(req, res) => {
    const newNotification = new notificationModels({

    });

    try {
        const savedNotification = await newNotification.save();
        return res.status(201).json(savedNotification);
    } catch (err) {
        return res.status(500).json(err);
    }
};
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

module.exports.getNotification = getNotification;
module.exports.getNotifications = getNotifications;
module.exports.updateNotification = updateNotification;
module.exports.deleteNotification = deleteNotification;
module.exports.createNotification = createNotification;