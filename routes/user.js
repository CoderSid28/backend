const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const authenticateToken = require("./userAuth");
// Sign up
router.post("/sign-up", async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    const { username, email, password, address } = req.body;

    // Check if any field is missing
    if (!username || !email || !password || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check username length
    if (username.length < 4) {
      return res.status(400).json({ message: "Username should be greater than 3" });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Normalize email and check if it exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check password length
    if (password.length < 5) {
      return res.status(400).json({ message: "Password should be greater than 5" });
    }
    const hashPass =  await bcrypt.hash(password,10);
    // Create new user
    const newUser = new User({
      username,
      email: normalizedEmail, // Store normalized email
      password:hashPass ,// Reminder: Hash this in production!
      address,
    });

    await newUser.save();
    return res.status(200).json({ message: "SignUp Successfully" });

  } catch (error) {
    console.log("Error:", error); // Log the full error for debugging
    // Handle MongoDB duplicate key error
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});
// Sign in
router.post("/sign-in", async (req, res) => {
    console.log("Request Body:", req.body);
  
    try {
        const { username, password } = req.body;
           
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        bcrypt.compare(password, existingUser.password, (err, data) => {
            if (err) {
                return res.status(500).json({ message: "Error comparing passwords" });
            }
            if (data) {
                const authClaims = {
                    name: existingUser.username,
                    role: existingUser.role
                };
                const token = jwt.sign(
                    authClaims,
                    "bookNest123",
                    { expiresIn: "50d" }
                );
                res.status(200).json({ 
                    message: "Sign-in successful", // Added here
                    id: existingUser._id,
                    role: existingUser.role,
                    token: token
                }); 
            } else {
                res.status(400).json({ message: "Invalid Credentials" });
            }
        });
    } catch (error) {
        console.log("Error:", error);
        if (error.name === "MongoServerError" && error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});
//get-user-information
router.get("/get-user-information", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const data = await User.findById(id).select("-password");
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
// update-address
router.put("/update-address", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { address } = req.body;
        await User.findByIdAndUpdate(id, { address: address });
        return res.status(200).json({ message: "Address updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;