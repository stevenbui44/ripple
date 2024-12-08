const follows = require('../data/follows.json');

module.exports = {

    // ROUTE 5: GET /howls/following (i.e. the entire feed, given all followers)
    // ROUTE 7: GET /users/:userId/following 
    getFollowing: (userId) => {
        return new Promise((resolve, reject) => {
            const userFollows = follows[userId];
            if (userFollows) {
                resolve(userFollows.following);
            } else {
                resolve([]);
            }
        });
    },

    // ROUTE 8: /users/:userId/follow
    follow: (followerId, targetUserId) => {
        return new Promise((resolve, reject) => {
            if (!follows[followerId]) {
                follows[followerId] = {
                    userId: followerId,
                    following: []
                };
            }
            if (!follows[followerId].following.includes(targetUserId)) {
                follows[followerId].following.push(targetUserId);
            }
            resolve(follows[followerId].following);
        });
    },

    // ROUTE 9: /users/:userId/unfollow
    unfollow: (followerId, targetUserId) => {
        return new Promise((resolve, reject) => {
            if (follows[followerId]) {
                follows[followerId].following = follows[followerId].following.filter(id => id !== targetUserId);
                resolve(follows[followerId].following);
            } else {
                reject();
            }
        });
    }
}
