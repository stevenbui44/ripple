const express = require('express');
const router = express.Router();

// https://github.ncsu.edu/engr-csc342/csc342-2024Fall-shbui/blob/main/ScratchPad/Day15/a/src/routes.js
// https://github.ncsu.edu/engr-csc342/csc342-2024Fall-shbui/blob/main/ScratchPad/Day15/a/src/api/APIRoutes.js

// In day 15, we had a FrontendRoutes.js and APIRoutes.js file, but we can just 
// put the backend endpoints here since the frontend endpoints are in server.js


const userDAO = require('./data/usersDAO');
const howlDAO = require('./data/howlsDAO');
const followDAO = require('./data/followsDAO');

const { loginUser, loggedInUsers } = require('./middleware/LoginMiddleware.js');



let currentUser = null;



// UserDAO:

// ROUTE 1: 'Authenticating' by checking if username corresponds to one of the 2 users
router.post('/login', (req, res) => {

    const username = req.body.username;
    // console.log('username:', username)
    // {
    //     "username": "student"
    // }
    
    userDAO.getUserByUsername(username).then(user => {
        currentUser = user;

        loginUser(res, user);

        res.json(user);
    }).catch(() => {
        res.status(401).json({ error: "Invalid username" });
    });
});


// ROUTE 2: Getting the current user
router.get('/users/current', (req, res) => {

    // console.log('currentUser:', currentUser)

    // currentUser = {"id": 1,
    //       "first_name": "Stu",
    //       "last_name": "Dent",
    //       "username": "student",
    //       "avatar": "https://robohash.org/veniamdoloresenim.png?size=64x64&set=set1"}
    // res.json(currentUser);

    const authToken = req.cookies['HowlerCookie'];
    if (authToken && loggedInUsers[authToken]) {
        res.json(loggedInUsers[authToken]);
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
});


// ROUTE 6: Getting a specific user
router.get('/users/:userId', (req, res) => {
    userDAO.getUserById(Number(req.params.userId)).then(user => {
        res.json(user);
    }).catch(() => {
        res.status(404).json({ error: "User not found" });
    });
});


// Getting user profile
router.get('/users/username/:username', (req, res) => {
    userDAO.getUserByUsername(req.params.username).then(user => {
        res.json(user);
    }).catch(() => {
        res.status(404).json({ error: "User not found" });
    });
});




// HowlDAO:

// ROUTE 3: Creating a new howl
router.post('/howls', (req, res) => {

    // console.log('currentUser:', currentUser)

    if (!currentUser) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    loginUser(res, currentUser);

    const newHowl = {
        userId: currentUser.id,
        text: req.body.text
    };
    // {
    //     "text": "this is my howl!"
    // }

    howlDAO.addHowl(newHowl).then(howl => {
        res.status(201).json(howl);
    }).catch(() => {
        res.status(400).json({ error: "Invalid howl data" });
    });
});


// ROUTE 4: Getting all howls by a specific user
router.get('/users/:userId/howls', (req, res) => {
    howlDAO.getHowlsByUserId(Number(req.params.userId)).then(howls => {
        res.json(howls);
    });
});


// ROUTE 5: Getting all howls of all following, basically showing the entire feed
router.get('/howls/following', (req, res) => {

    // console.log('currentUser:', currentUser)

    if (!currentUser) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    // STEP ONE: Get the user's following first
    followDAO.getFollowing(currentUser.id).then(following => {

        // STEP TWO: Get all of the user's following's HOWLS next
        const ids = [currentUser.id];
        for (let id of following) {
            ids.push(id)
        }
        const promises = ids.map(userId => howlDAO.getHowlsByUserId(userId));

        // STEP THREE: Sort all of the howls in order of most recent first
        Promise.all(promises).then(howlArrays => {
            let allHowls = [];
            for (let array of howlArrays) {
                for (let howl of array) {
                    allHowls.push(howl);
                }
            }
            const sortedHowls = allHowls.sort((a, b) => 
                new Date(b.datetime) - new Date(a.datetime)
            );
            res.json(sortedHowls);
        });
    });
});





// FollowDAO:

// ROUTE 7: Getting a specific user's following list
router.get('/users/:userId/following', (req, res) => {
    followDAO.getFollowing(req.params.userId).then(following => {
        res.json(following);
    });
});


// ROUTE 8: Following a user
router.post('/users/:userId/follow', (req, res) => {

    // console.log('currentUser:', currentUser)

    if (!currentUser) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    // check if you're trying to follow yourself
    if (currentUser.id === Number(req.params.userId)) {
        return res.status(400).json({ error: "Cannot follow yourself" });
    }

    // NOTE: We don't req.body for this, use req.params instead since we only need userId
    followDAO.follow(currentUser.id, Number(req.params.userId)).then(following => {
        res.json({ success: true, following: following });
    });
});


// ROUTE 9: Unfollowing a user
router.post('/users/:userId/unfollow', (req, res) => {

    // console.log('currentUser:', currentUser)

    if (!currentUser) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    
    followDAO.getFollowing(currentUser.id).then(following => {
        // check if you're even following the user
        if (!following.includes(Number(req.params.userId))) {
            res.status(400).json({ error: "Not following this user" });
            return;
        }
        
        followDAO.unfollow(currentUser.id, Number(req.params.userId)).then(following => {
            res.json({ success: true, following: following });
        });
    });
});


module.exports = router;