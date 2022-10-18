const mongoose = require("mongoose");
const { Schema } = mongoose;
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;