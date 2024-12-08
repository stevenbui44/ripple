const crypto = require('crypto');

// REFERENCE: DAY 17
// https://github.ncsu.edu/engr-csc342/csc342-2024Fall-shbui/blob/main/ScratchPad/Day17/b/src/middleware/SessionCookieMiddleware.js

// Store logged in users
const loggedInUsers = {};

// Cookie name for our auth
const AUTH_COOKIE_NAME = 'HowlerCookie';

// Generate a random token for auth
function generateAuthToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware that just sends you to /login if you're not logged in
function LoginMiddleware(req, res, next) {
    const authToken = req.cookies[AUTH_COOKIE_NAME];
    
    // CASE 1: The request does NOT have a cookie = log in
    if (!authToken || !loggedInUsers[authToken]) {
        res.redirect('/login');
        return;
    }

    // CASE 2: The user DOES have a cookie = you're good
    req.user = loggedInUsers[authToken];
    next();
}

// Login helper function to set cookie and store user
function loginUser(res, user) {
    const authToken = generateAuthToken();
    loggedInUsers[authToken] = user;
    
    // Set cookie with token
    res.cookie(AUTH_COOKIE_NAME, authToken, {
        secure: true,
        httpOnly: true,
        maxAge: 10 * 60 * 1000  // 10 minutes 
    });
    
    return authToken;
}

module.exports = {
    LoginMiddleware,
    loginUser,
    loggedInUsers
};