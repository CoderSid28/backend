const mongoose = require("mongoose");
require("dotenv").config(); // Ensure dotenv is loaded

const conn = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.URI);
        console.log("Connected to Database");
    } catch (error) {
        console.log("Database Connection Error:", error);
    }
};

conn();