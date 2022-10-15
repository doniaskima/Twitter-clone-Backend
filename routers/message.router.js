const express = require('express');
const router = express.router();

const {
    deleteMessageById,
    createMessage
} = require("../controllers/message.controller");


router.route("/delete-chat", deleteMessageById);
router.route("/create-message", createMessage);


module.exports = router;