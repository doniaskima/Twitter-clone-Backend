require("dotenv").config();
const port = process.env.PORT || 3000;
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const compression = require("compression");
//import Routes 
const userRouter = require("./routers/user.router");
const postRouter = require("./routers/post.router");

const messageRouter = require("./routers/message.router");
const {
    createMessage,
    startMessage,
} = require("./controllers/message.controller");


const app = express();

const server = http.createServer(app);
const io = socketio(server, { cors: true });
//DB connection
mongoose.connect(process.env.MONGO_DB_URI);
mongoose.connection.on("connected", () => {
    console.log("DB connected");
});
mongoose.connection.on("error", (err) => {
    console.log("mongodb failed with", err);
});
app.get("/", (req, res) => {
    return res.send({ message: "Welcome :))" });
});

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/messages", messageRouter);


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());


//server listening
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});