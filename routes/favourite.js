const router = require("express").Router();
const User = require("../models/user");
const  authenticateToken  = require("./userAuth");

// Add book to favourites
router.put("/add-book-to-favourite", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;
    if (!id || !bookid) {
      return res.status(400).json({ message: "User ID and Book ID are required" });
    }

    const userData = await User.findById(id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyFavourite = userData.favorite.includes(bookid);
    if (isAlreadyFavourite) {
      return res.status(200).json({ message: "Book is already in favourites" });
    }

    await User.findByIdAndUpdate(id, { $push: { favorite: bookid } });
    return res.status(200).json({ message: "Book added to favourites" });
  } catch (error) {
    console.error("Error adding book to favourites:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
// remove the book from favourite
router.put("/remove-book-from-favourite", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookFavourite = userData.favorite.includes(bookid);
        if (isBookFavourite) {
            await User.findByIdAndUpdate(id, { $pull: { favorite: bookid } });
        }
        return res.status(200).json({ message: "Book removed from favourites" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
// get Favourite books of particular user
router.get("/get-favourite-books", authenticateToken, async (req, res) => {
    try {   
        const { id } = req.headers;
        const userData = await User.findById(id).populate("favorite");
        const favouriteBooks = userData.favorite;
        return res.json({ 
            status: "Success",
            data: favouriteBooks,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occurred" });
    }
});


module.exports = router;