require("dotenv").config();
const User = require("../models/user.model");
const Post = require("../models/post.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { extend } = require("lodash");
const { newNotification } = require("./notification.controller");
const transporter = require("../utils/nodemailer");

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email }).catch((err) => {
    console.log(err);
  });
  if (user) {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      const token = jwt.sign(
        { id: user._id, name: user.name },
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

const signup = async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist)
      return res.status(403).json({ message: "Email already exist" });

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      bio: "Hi there! I'm using Donia's Twitter CLone",
      profileUrl:
        "https://res.cloudinary.com/formula-web-apps/image/upload/v1623766149/148-1486972_mystery-man-avatar-circle-clipart_kldmy3.jpg",
    });
    const savedUser = await newUser.save();
    const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_KEY, {
      expiresIn: "1h",
    });

    await transporter.sendMail({
      from: "Twitter@clone-Twitter.com",
      to: savedUser.email,
      subject: "Twitter Notification - Forgotten Password",
      body: `<p>${token}</p>`,
    });

    return res.status(200).json({ message: "verify ur account" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const searchById = async (req, res, next, userId) => {
  try {
    const userObject = await User.findById(userId);
    if (!userObject) {
      return res.json({ success: false, massage: "User not found" });
    }
    req.userProfile = userObject;
    next();
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to Update User",
      errorMessage: error.message,
    });
  }
};

const getSingleUserInfo = async (req, res) => {
  try {
    const user = req.userProfile;
    return res.json({ success: true, user: user });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to Update User",
      errorMessage: error.message,
    });
  }
};

const updateCurrentUserDetails = async (req, res) => {
  try {
    let userUpdate = req.body;
    let user = req.userProfile;

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

const follow = async (req, res) => {
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
    const alreadyExist =
      targetUser.followers.indexOf(sourceUser._id) === -1 ? false : true;
    if (alreadyExist) {
      return res.status(409).json({
        success: false,
        message: "source user already follows target user",
      });
    }
    await newNotification(targetId, sourceId, "NEW_FOLLOWER", 0);
    targetUser.followers.push(sourceUser._id);
    sourceUser.following.push(targetUser._id);
    await targetUser.save();
    await sourceUser.save();
    return res.json({ success: true, targetUserId: targetUser._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const unFollow = async (req, res) => {
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
        message: "source user not follows target user",
      });
    }
    targetUser.followers.splice(index, 1);
    index = sourceUser.following.indexOf(targetId);
    sourceUser.following.splice(index, 1);
    await targetUser.save();
    await sourceUser.save();
    return res.json({ success: true, targetUserId: targetUser._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const fetchUserPosts = async (req, res) => {
  try {
    const { userId, clientId } = req.body;
    const user = await User.findById(userId);
    const posts = await Post.find({ author: user._id });
    let userPosts = [];

    for (const post of posts) {
      const isLikedByUser = post.likes.some(
        (id) => id.toString() === clientId.toString()
      );

      userPosts.push({
        ...post._doc,
        isLikedByUser: isLikedByUser,
        authorName: user.name,
        authorUsername: user.username,
        authorProfileUrl: user.profileUrl,
      });
    }

    return res.json({ success: true, posts: userPosts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const fetchUserFollowers = async (req, res) => {
  try {
    const { userId, clientId } = req.body;
    const user = await User.findById(userId);
    const client = await User.findById(clientId);
    const followers = await User.find(
      { _id: { $in: user.followers } },
      "_id name username profileUrl"
    );
    let result = [];
    for (const obj of followers) {
      const isFollowedByClient = client.following.some(
        (id) => obj.id.toString() === id.toString()
      );
      result.push({ ...obj._doc, isFollowedByClient });
    }
    return res.json({ success: true, followers: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const fetchUserFollowing = async (req, res) => {
  try {
    const { userId, clientId } = req.body;
    const user = await User.findById(userId);
    const client = await User.findById(clientId);
    const following = await User.find(
      { _id: { $in: user.following } },
      "_id name username profileUrl"
    );
    let result = [];
    for (const obj of following) {
      const isFollowedByClient = client.following.some(
        (id) => obj.id.toString() === id.toString()
      );
      result.push({ ...obj._doc, isFollowedByClient });
    }
    return res.json({ success: true, following: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserFeed = async (req, res) => {
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
      let author = await User.findById(post.author);
      const isLikedByUser = post.likes.some(
        (id) => id.toString() === user._id.toString()
      );
      feed.push({
        ...post._doc,
        isLikedByUser: isLikedByUser,
        authorName: author.name,
        authorUsername: author.username,
        authorProfileUrl: author.profileUrl,
      });
    }
    feed.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return res.json({ success: true, feed: feed });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const fetchRecentlyJoinedUsers = async (req, res) => {
  try {
    const user = req.userProfile;
    const users = await User.find(
      { $and: [{ _id: { $nin: user.following } }, { _id: { $ne: user._id } }] },
      "id name username profileUrl"
    );

    return res.json({ success: true, users: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const searchUser = async (req, res) => {
  try {
    const query = req.query.text;
    const users = await User.find({
      text: {
        $regex: query,
        $options: "i",
      },
    }).select("id name username profileUrl email");
    console.log(users);
    if (users.length === 0) {
      return res.json({ success: false, message: "No results" });
    }
    console.log(users);
    return res.json({ success: true, users: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getUserChats = async (req, res) => {
  const user = req.userProfile;
  const data = await User.find(
    { _id: { $in: user.chats } },
    "_id name username email profileUrl"
  ).catch((err) => console.log(err));
  return res.status(200).json({ success: true, chats: data });
};

const forgotPassword = async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (!userExist)
      return res
        .status(200)
        .json({
          message: "if your email valid check your inbox to reset password ",
        });
    const token = jwt.sign({ email: userExist.email }, process.env.TOKEN_KEY, {
      expiresIn: "1h",
    });
    await transporter.sendMail({
      from: "Twitter@clone-Twitter.com",
      to: savedUser.email,
      subject: "reset password",
      body: `<p>${token}</p>`,
    });
    return res
      .status(200)
      .json({
        message: "if your email valid check your inbox to reset password ",
      });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const verifyEmail = async (req, res) => {
  try {
    if (!req.body.token) {
      return res.status(403).json("no verification token");
    }
    const data = jwt.verify(req.body.token, process.env.TOKEN_KEY);
    const user = await User.findById(data._id);
    user.isEmailVerified = true;
    await user.save();
    return res.status(200).json("account verified");
  } catch (err) {
    return res.status(500).json(err);
  }
};

const resetPassword = async (req, res) => {
  try {
    if (!req.body.token) {
      return res.status(403).json("no verificarion token provided");
    }
    const data = jwt.verify(req.body.token, process.env.TOKEN_KEY);
    const user = await User.findOne({ email: data.email });
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "your password was changed" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  login,
  signup,
  updateCurrentUserDetails,
  fetchRecentlyJoinedUsers,
  searchById,
  follow,
  unFollow,
  fetchUserPosts,
  fetchUserFollowers,
  fetchUserFollowing,
  getUserFeed,
  getSingleUserInfo,
  searchUser,
  getUserChats,
  resetPassword,
  forgotPassword,
  verifyEmail,
};
