const express = require("express");
const router = express.Router();
const {

    deleteMessageById,
    deleteChatByRecipientId,
} = require("../controllers/message.controller");

router.route("/delete-chat").post(deleteChatByRecipientId);
router.route("/:messageId").delete(deleteMessageById);

module.exports = router;