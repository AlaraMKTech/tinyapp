const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {};
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    user: user,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  };
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(400).send("Email is already in use.");
  };
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };
  console.log(users);
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  console.log("User from cookie:", user);
  const templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    user: user,
    id: shortURL,
    longURL: longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

function generateRandomString() {
  const length = 6;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};