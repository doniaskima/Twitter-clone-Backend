const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    type: { type: String, enum: ["NEW_FOLLOWER", "LIKED", "NEW_COMMENT"] },
    targetId: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "User" },
    sourceId: { type: Schema.Types.ObjectId, ref: "User" },

}, { timestamps: true });

const Notification = mongoose.model("notifications", notificationSchema);
module.exports = Notification;