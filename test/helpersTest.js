const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined when email does not exist', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });
});

const testUrlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
  "9a3bRt": {
    longURL: "https://www.reddit.com",
    userID: "userRandomID",
  },
};

describe('urlsForUser', function() {
  it('should return only URLs that belong to the specified user', function() {
    const userId = "userRandomID";
    const expectedUrls = {
      "b6UTxQ": {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID",
      },
      "9a3bRt": {
        longURL: "https://www.reddit.com",
        userID: "userRandomID",
      },
    };

    const result = urlsForUser(userId, testUrlDatabase);
    assert.deepEqual(result, expectedUrls);
  });

  it('should return an empty object if no URLs belong to the specified user', function() {
    const userId = "nonExistentUser";
    const result = urlsForUser(userId, testUrlDatabase);
    assert.deepEqual(result, {});
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const emptyDatabase = {};
    const userId = "userRandomID";
    const result = urlsForUser(userId, emptyDatabase);
    assert.deepEqual(result, {});
  });

  it('should not return URLs that do not belong to the specified user', function() {
    const userId = "userRandomID";
    const result = urlsForUser(userId, testUrlDatabase);
    assert.notProperty(result, "i3BoGr");  // Ensure this URL does not belong to userRandomID
  });
});