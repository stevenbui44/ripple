const howls = require('../data/howls.json');

module.exports = {

    // ROUTE 3: POST /howls
    addHowl: (howl) => {
        return new Promise((resolve, reject) => {
            if (!howl.userId || !howl.text) {
                reject();
                return;
            }
            const newHowl = {
                id: howls.length + 1,
                userId: howl.userId,
                datetime: new Date().toISOString(),
                text: howl.text
            };
            howls.push(newHowl);
            resolve(newHowl);
        });
    },

    // ROUTE 4: GET /users/:userId/howls
    // ROUTE 5: GET /howls/following (i.e. the entire feed, given all followers)
    getHowlsByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const userHowls = howls.filter(howl => howl.userId === userId);
            resolve(userHowls);
        });
    }
}