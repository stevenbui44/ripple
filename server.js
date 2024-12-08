// Dependencies
const express = require('express');
// const multer = require('multer');
// const upload = multer({ dest: 'static/uploads' });
const path = require('path');


const cookieParser = require('cookie-parser');
const { LoginMiddleware } = require('./src/middleware/LoginMiddleware.js');


// Use express and port 3000
const app = express();
const PORT = 3001;

// Serve static files
app.use('/static', express.static('static'));

// routing
const routes = require('./src/routes');
app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);


// ROUTE 1: Main page
app.get('/', LoginMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/main.html'));
});

// ROUTE 2: User profile page
app.get('/user/:username', LoginMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/profile.html'));
});

// ROUTE 3: Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/login.html'));
});


// Ask our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));