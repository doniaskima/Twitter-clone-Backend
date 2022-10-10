require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { extend } = require("lodash");
const { newNotification } = require("./notification.controller");
const User = require("../models/usker.model");
const Post = require("../models/post.model");

const login = async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).catch((err) => {
        console.log(err);
    });

    if (user) {
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            const token = jwt.sign({ id: user._id, name: user.name },
                process.env.JWT_SECRET
            );
            return res.json({
                success: true,
                message: "Login Successful",
                user: user,
                token: token,
            });
        }
        return res.json({
            token: null,
            user: null,
            success: false,
            message: "Wrong password, please try again",
        });
    }
    return res.json({
        token: null,
        user: null,
        success: false,
        message: "No account found with entered email",
    });
};
const signup = async(req, res) => {
    const { name, username, email, password } = req.body;
    let user = await User.findOne({ email: email }).catch((err) => {
        console.log(err);
    });
    if (user) {
        return res.json({
            token: null,
            user: null,
            success: false,
            message: "Account with email already exists, Try logging in instead!",
        });
    }
    user = await User.findOne({ username: username }).catch((err) => {
        console.log(err);
    });
    if (user) {
        return res.json({
            token: null,
            user: null,
            success: false,
            message: "Account with username already exists"
        })
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: hashedPassword,
            bio: "Hi there I'm using Donia's Twitter Clone",
            profileUrl: "https://res.cloudinary.com/formula-web-apps/image/upload/v1623766149/148-1486972_mystery-man-avatar-circle-clipart_kldmy3.jpg",
        });

        const savedUser = await newUser.save();
        const token = jwt.sign({ id: savedUser._id, name: savedUser.name },
            process.env.JWT_SECRET
        );

        return res.json({
            user: savedUser,
            token: token,
            success: true,
            message: "Signed up successfully",
        });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            user: null,
            token: null,
            message: err.message,
        });
    }
};
const searchById = async(req, res, next, userId) => {
    try {
        const userObject = await User.findById(userId);
        if (!userObject) {
            return res.json({ success: false, massage: "User not found" });
        }
        req.user = userObject;
        next();
    } catch (error) {
        res.json({
            success: false,
            message: "Failed to Update User",
            errorMessage: error.message,
        });
    }
};

const updateCurrentUserDetails = async(req, res) => {
    try {
        let userUpdate = req.body;
        let { user } = req;

        let search = await User.findOne({ username: userUpdate.username });

        if (search && search.email !== user.email) {
            return res.json({
                success: false,
                errorMessage: "Username already exists",
            });
        }

        user = extend(user, userUpdate);
        user = await user.save();
        res.json({ success: true, user: user });
    } catch (err) {
        res.json({
            success: false,
            message: "Failed to Update User",
            errorMessage: err.message,
        });
    }
};

const follow = async(req, res) => {
    try {
        const { targetId, sourceId } = req.body;
        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            return res.json({ success: false, message: "Invalid Target Id" });
        }
        const sourceId = await User.findById(sourceId);
        if (!sourceId) {
            return res.json({
                success: false,
                message: "Invalid Target Id",
            });
        }
        await newNotification(targetId, sourceId, "NEW_FOLLOWER", 0);
        targetUser.followers.push(sourceId);
        sourceUser.following.push(targetUser);
        return res.json({ success: true, targetUserId: targetUser._id });
        await targetUser.save();
        await sourceUser.save();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const fetchUserPosts = async(req, res) => {
    try {
        const { userId, clientId } = req;
        const user = await User.findById(userId);
        const posts = await Post.find({ author: user._id });
        let userPosts = [];
        for (const post of posts) {
            const isLikedByUser = post.likes.some((id) => id.toString() === clientId.toString());
            userPosts.push({
                ...post._doc,
                isLikedByUser: isLikedByUser,
                authorName: user.name,
                authorUsername: user.username,
                authorProfileUrl: user.profileUrl,
            })
        }
        return res.json({ success: true, posts: posts });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSingleUserInfo = async(req, res) => {
    try {
        const { user } = req;
        return res.json({ success: true, user: user })
    } catch (error) {
        res.json({
            success: false,
            message: "Failed to update User",
            errorMessage: error.message,
        })
    }
}


const fetchUserFollowers = async(req, res) => {
    try {
        const { user } = req;
        const followers = await User.find({ _id: { $in: user.followers } },
            "_id name username"
        );
        return res.json({ success: true, followers: followers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const fetchUserFollowing = async(req, res) => {
    try {
        const { user } = req;
        const following = await User.find({ _id: { $in: user.following } },
            "_id name username"
        );
        return res.json({ success: true, following: following });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


const unfollow = (req, res) => {
    try {
        const { targetId, sourceId } = req.body;
        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            return res.json({ success: false, message: "Invalid Target Id" });
        }
        const sourceUser = await User.findById(sourceId);
        if (!sourceUser) {
            return res.json({ success: false, message: "Invalid Source Id" });
        }
        let index = targetUser.followers.indexOf(sourceId);
        if (index === -1) {
            return res.json({
                success: false,
                message: "source user  not follows target user",
            })
        }
        targetUser.followers.splice(index, 1);
        index = sourceUser.following.indexOf(targetId);
        sourceUser.following.splice(index, 1);
        await targetUser.save();
        await sourceUser.save();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
const searchUser = async(req, res) => {
    try {
        const search = req.query.text;
        const users = await User.find({ $text: { $search: search } }).select(
            "id name username profileUrl"
        );
        if (users.length === 0) {
            return res.json({ success: false, message: "No results" });
        }
        return res.json({ success: true, users: users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
const getUserFeed = async(req, res) => {
    try {
        const user = req.userProfile;
        let tempFeed = [];
        let posts = await Post.find({ author: user._id });
        tempFeed.push(posts);
        for (const _user of user.following) {
            posts = await Post.find({ author: _user._id });
            tempFeed.push(posts);
        }
        tempFeed = tempFeed.flat();
        let feed = [];
        for (const post of tempFeed) {
            let author = await User.finById(post.author);
            const isLikedByUser = post.likes.some(
                (id) => id.toString() === user._id.toString()
            );
            feed.push({
                isLikedByUser: isLikedByUser,
                authorName: author.name,
                authorUsername: author.username,
                authorProfileUrl: author.profileUrl,
            });
        }

        return res.json({ success: true, feed: feed })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getUserChats = async(req, res) => {
    const user = req.userProfile;
    const
    const data = await User.find({ _id: { $in: user.chats } },
        "_id name username email profileUrl"
    ).catch((err) => console.log(err));
    return res.status(200).json({ success: true, chats: data })
}




module.exports = {
    login,
    unfollow,
    signup,
    searchById,
    updateCurrentUserDetails,
    follow,
    fetchUserPosts,
    getSingleUserInfo,
    fetchUserFollowers,
    fetchUserFollowing,
    searchUser,
    getUserChats
};