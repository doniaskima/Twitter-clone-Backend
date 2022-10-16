const Message = require("../models/message.model");
const User = require("../models/user.model");
const crypto = require("crypto");

const encrypt = (message) => {
    // key to encrypt and decrypted  (random 32 Bytes)
    const key = crypto.randomBytes(32);
    //iv - initialization vector (random 16 Bytes)
    const iv = crypto.randomBytes(16);
    // cipher function to encrypt the message
    // aes-256-cbc algorithm to encrypt and decrypt the data.
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encryptedMessage = cipher.update(message);
    encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
    return {
        iv: iv.toString("hex"),
        encryptedMessage: encryptedMessage.toString("hex"),
        key: key.toString("hex"),
    };
};
const startMessage = async(senderId, receiverEmail) => {
    const user = await User.findOne({ _id: senderId });
    if (user) {
        const receiver = await User.findOne({ email: receiverEmail });
        if (receiver) {
            if (!user.chats.includes(senderId) && user._id !== receiver._id) {
                user.chats.push(receiver._id);
                await user
                    .save()
                    .then(() => {
                        return true;
                    })
                    .catch(() => {
                        return null;
                    });
            }
        } else {
            return null;
        }
    } else {
        return null;
    }
};

const createMessage = async(senderId, receiverEmail, message) => {
    let info = null;
    let isNewRecipient = false;
    const user = await User.findOne({ _id: senderId }).catch((err) => {
        console.log(err);
    });

    if (user) {
        const receiver = await User.findOne({ email: receiverEmail });
        if (receiver) {
            if (!receiver.chats.includes(senderId)) {
                isNewRecipient = true;
                receiver.chats.push(senderId);
                await receiver.save();
            }
            const encryptedMessage = encrypt(message);
            const newMessage = new Message({
                sender: senderId,
                receiver: receiver._id,
                message: encryptedMessage.encryptedMessage,
                iv: encryptedMessage.iv,
                key: encryptedMessage.key,
            });
            await newMessage.save();
            info = {
                sender: {
                    name: user.name,
                    email: user.email,
                    _id: user._id,
                    profileUrl: user.profileUrl,
                    username: user.username,
                },
                receiver: {
                    name: receiver.name,
                    _id: receiver._id,
                    email: receiver.email,
                    profileUrl: user.profileUrl,
                    username: user.username,
                },
                iv: newMessage.iv,
                key: newMessage.key,
                message: newMessage.key,
                createdAt: newMessage.createdAt,
                messageId: newMessage._id,

            }

        }
    }
    return { info, isNewRecipient };
};

const deleteMessageById = async(req, res) => {
    const { messageId } = req.params;
    Message.findByIdAndDelete(messageId).then(() => {
        return res.json({ success: true, message: "message deleted" });
    }).catch((err) => {
        console.log(err);
        return res.json({ success: false, message: err.message });
    });
};

const deleteMessages = (senderId, receiverId) => {
    Message.deleteMany({ sender: senderId, receiver: receiverId })
        .then(() => {
            Message.deleteMany({
                    receiver: senderId,
                    sender: receiverId,
                })
                .then(() => {
                    return true;
                })
                .catch((err) => {
                    console.log(err);
                    return false;
                });
        })
        .catch((err) => {
            console.log(err);
            return false;
        });
};


const getMessages = (req, res) => {
    const { userId, receiverId } = req.body;
    User.findOne({ _id: userId }, (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        } else if (!user) {
            return res.json({ success: false, message: "user not exist" })
        } else {
            User.findOne({ _id: receiverId }, (err, receiver) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message })
                } else if (!receiver) {
                    return res.status().json({ success: false, message: "receiver not exist" });
                } else {
                    Message.find({ sender: userId, receiver: receiverId })
                }
            })
        }
    })
}
module.exports = {
    createMessage,
    deleteMessageById,
    startMessage,
    getMessages,
}