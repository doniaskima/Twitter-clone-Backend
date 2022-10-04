require("dotenv").config();
const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { extend } = require("lodash");

const login = async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).catch((err) => {
        console.log(err);
    });

    if (user) {
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            const token = jwt.sign({ id: user._id, name: user.name },
                process.env.secret
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
    const user = await User.findOne({ email: email }).catch((err) => {
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
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        const token = jwt.sign({ id: savedUser._id, name: savedUser.name },
            process.env.secret
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

const updateCurrentUsersDetails = async(req, res) => {
    try {
        let userUpdate = req.body;
        let { user } = req;
        let search = await User.findOne({ username: userUpdate.username });
        if (search && search.email !== user.email) {
            return res.json({
                success: false,
                erroressage: "Username already exists",

            });
        }
        user = extend(user, userUpdate);
        user = await user.save();
        res.json({ success: true, data: user });
    } catch (err) {
      success: false,
      message: "Failed to Update User",
      errorMessage: err.message,
    }
}




module.exports = {
    login,
    signup,
    searchById,
    updateCurrentUsersDetails
};