const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./conn/conn");


// Middleware
app.use(cors(
  {
    origin:"*"
  }
));
app.use(express.json());

// Routes
const user = require("./routes/user");
const Book = require("./routes/book");
const Favourite = require("./routes/favourite");
const Cart = require("./routes/cart");
const Order = require("./routes/order");


// Route mounting
app.use("/api/v1", user);
app.use("/api/v1", Book);
app.use("/api/v1", Favourite);
app.use("/api/v1", Cart);
app.use("/api/v1", Order);


// Port configuration
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`Server active at port ${PORT}`);
});