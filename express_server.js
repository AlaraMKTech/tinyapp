const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

function urlsForUser(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

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
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(400).send("Email is already in use.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };

  console.log(users);
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    return res.redirect("/urls");
  }
  res.render("register");
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    user: user || null,
  };
  if (userId) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid email or password.");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("You must be logged in to view your URLs.");
  }

  const user = users[userId];
  const userUrls = urlsForUser(userId);

  const templateVars = {
    user: user,
    urls: userUrls,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  const user = users[userId];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.id;
  
  if (!userId) {
    return res.status(403).send("You must be logged in to view a URL.");
  }

  const user = users[userId];
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
  const userId = req.cookies["user_id"];
  const shortURL = req.params.id;
  
  if (!userId) {
    return res.status(403).send("You must be logged in to edit a URL.");
  }

  const url = urlDatabase[shortURL];
  
  if (!url) {
    return res.status(404).send("Error: URL not found.");
  }

  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }

  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("You must be logged in to shorten URLs.");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    return res.status(404).send("Error: Short URL not found.");
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.id;
  
  if (!userId) {
    return res.status(403).send("You must be logged in to delete a URL.");
  }

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

function generateRandomString() {
  const length = 6;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};