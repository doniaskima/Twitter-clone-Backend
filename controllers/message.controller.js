const messageModels = require("../models/message.models");

const createMessage = async(req, res) => {
    const newMessage = new messageModels({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: req.body.avatar,
        email: req.body.email,
        password: req.body.password,
    });

    try {
        const savedMessage = await newMessage.save();
        return res.status(201).json(savedMessage);
    } catch (err) {
        return res.status(500).json(err);
    }
};
const getMessages = async(req, res) => {
    try {
        const messages = await messageModels.find();
        return res.status(200).json(messages);
    } catch (err) {
        return res.status(500).json(err);
    }
};
const getMessage = async(req, res) => {
    const message = req.message;
    try {
        return res.status(200).json(message);
    } catch (err) {
        return res.status(500).json(err);
    }
};

const deleteMessage = async(req, res) => {
    const id = req.message._id;
    try {
        const message = await messageModels.findByIdAndDelete(id);
        return res.status(200).json(message);
    } catch (err) {
        return res.status(500).json(err);
    }
};
const updateMessage = async(req, res) => {
    const id = req.message._id;
    try {
        const message = await messageModels.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        return res.status(200).json(message);
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports.getMessage = getMessage;
module.exports.getMessages = getMessages;
module.exports.updateMessage = updateMessage;
module.exports.deleteMessage = deleteMessage;
module.exports.createMessage = createMessage;