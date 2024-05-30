const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//simulate a 5s delay in getting the book list
const getBooks = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(books);
  }, 5000);
});

public_users.post("/register", (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(404)
        .json({ message: "please provide both username & password" });
    }
    if (isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User registered successfully" });
    } else {
      return res.status(400).json({ message: "user already exists" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    let allBooks = await getBooks;
    res.status(200).json({ data: JSON.stringify(allBooks) });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    let isbn = req.params.isbn;
    let allBooks = await getBooks;
    let book = allBooks[isbn];
    if (book) {
      return res.status(200).json({ data: book });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    let author = req.params.author;
    let allBooks = await getBooks;
    let book = Object.values(allBooks).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase()
    );
    if (book.length > 0) {
      return res.status(200).json({ data: book });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    let title = req.params.title;
    let allBooks = await getBooks;
    let book = Object.values(allBooks).filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );
    if (book.length > 0) {
      return res.status(200).json({ data: book });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  try {
    let isbn = req.params.isbn;
    let book = books[isbn];
    if (book) {
      return res.status(200).json({ data: book.reviews });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

module.exports.general = public_users;
