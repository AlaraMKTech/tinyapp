const getUserByEmail = function(email, database) {
    for (const userId in database) {
      if (database[userId].email === email) {
        return database[userId];
      }
    }
    return undefined;
  };
  
  const urlsForUser = function(userId, urlDatabase) {
    const result = {};
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === userId) {
        result[shortURL] = urlDatabase[shortURL];
      }
    }
    return result;
  };
  
  const generateRandomString = function() {
    const length = 6;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  module.exports = { getUserByEmail, urlsForUser, generateRandomString };