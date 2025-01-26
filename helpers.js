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
  
  module.exports = { getUserByEmail, urlsForUser };