require("dotenv").config();
const port = process.env.PORT || 3000;
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

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


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());


//server listening
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});