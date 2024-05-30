const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return !users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(404)
        .json({ message: "please provide both username & password" });
    }
    if (authenticatedUser(username, password)) {
      let token = jwt.sign({ username: username }, "fingerprint_customer", {
        expiresIn: "1h",
      });
      req.session.authorization = { token };
      return res.status(200).json({ message: "User logged in successfully." });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    let isbn = req.params.isbn;
    let { review } = req.body;
    const username = req.session.authorization.username;
    if (!username) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    if (!isbn || !review) {
      return res
        .status(404)
        .json({ message: "please provide isbn, review & rating" });
    }
    if (books[isbn]) {
      books[isbn].reviews[username] = { review };
      return res.status(200).json({ message: "Review added successfully" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    let isbn = req.params.isbn;
    const username = req.session.authorization.username;
    if (!username) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    if (!isbn) {
      return res.status(404).json({ message: "please provide isbn" });
    }
    if (books[isbn]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
