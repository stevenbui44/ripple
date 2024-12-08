const users = require('../data/users.json');

module.exports = {

    // ROUTE 1: POST /login
    getUserByUsername: (username) => {
        return new Promise((resolve, reject) => {
            // const account = Object.values(accounts).find(acc => acc.email === email);
            const user = Object.values(users).find(user => user.username === username);
            if (user) {
                resolve(user);
            } else {
                reject();
            }
        });
    },
   
    // ROUTE 6: GET /users/:userId
    getUserById: (id) => {
        return new Promise((resolve, reject) => {
            // const account = Object.values(accounts).find(acc => acc.email === email);
            const user = Object.values(users).find(user => user.id === id);
            if (user) {
                resolve(user);
            } else {
                reject();
            }
        });
    }
}
