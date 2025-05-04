// REQUIREMENTS
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");
const users = {};
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// SERVER SETUP AND MIDDLEWARE
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'angos-meleys',
  maxAge: 24 * 60 * 60 * 1000
}));

//ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) { 
    return res.redirect("/urls")
  }

  const templateVars = { user: null };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).send("Email is already in use.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: hashedPassword,
  };

  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) { 
    return res.redirect("/urls")
  }

  const templateVars = { user: null };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  const user = getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid credentials");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("You must be logged in to view your URLs!");
  }

  const urls = urlsForUser(userId, urlDatabase);

  const templateVars = {
    user,
    urls,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("You must be logged in to view your URLs!");
  }

  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("You must be logged in to view your URLs!");
  }

  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("Error: URL not found.");
  }

  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }

  const templateVars = {
    user: user,
    id: shortURL,
    longURL: url.longURL,
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("You must be logged in to view your URLs!");
  }

  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("Error: URL not found.");
  }

  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }


  const updatedLongURL = req.body.longURL;
  if (!updatedLongURL) {
    return res.status(400).send("Error: You must provide a long URL to update.");
  }

  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("You must be logged in to view your URLs!");
  }

  const longURL = req.body.longURL;
  if (!longURL) {
    return res.status(400).send("Error: You must provide a long URL to update.");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: userId,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("Error: Short URL not found.");
  }

  res.redirect(url.longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("You must be logged in to view your URLs!");
  }

  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("Error: URL not found.");
  }

  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// LISTENER (ACCEPT INCOMING REQUESTS)
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});