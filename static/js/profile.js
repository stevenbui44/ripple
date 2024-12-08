document.addEventListener('DOMContentLoaded', () => {

    // the URL username
    const username = window.location.pathname.split('/')[2];
    // user logged in
    let currentUser = null;
    // user of the page being looked at 
    let profileUser = null;

    
    // FUNCTION 1: Showing all howls
    // howls:
    // {
    //     "id": 1,
    //     "userId": 7,
    //     "datetime": "2020-05-29T03:50:25Z",
    //     "text": "Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros. Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat."
    // },
    function displayHowls(howls) {

        // posting everything after howls-header
        const howlsHeader = document.querySelector('.howls-header');
        
        // Function to process each howl
        const processHowl = (howl) => {
            return fetch(`/api/users/${howl.userId}`)
                .then(response => response.json())
                .then(user => {
                    const howlTemplate = document.createElement('div');
                    howlTemplate.className = 'howl';
                    howlTemplate.innerHTML = `
                        <div class="howl-header" onclick="window.location.href='/user/${user.username}'">
                            <img src="${user.avatar}" alt="${user.username} PFP" class="avatar">
                            <div class="user-info">
                                <span class="name">${user.first_name} ${user.last_name}</span>
                                <span class="handle">@${user.username}</span>
                            </div>
                            <span class="time">${formatDate(howl.datetime)}</span>
                        </div>
                        <p class="howl-message">${howl.text}</p>
                    `;
                    return howlTemplate;
                });
        };

        // Process all howls and add them to the page
        Promise.all(howls.map(processHowl))
            .then(howlTemplates => {

                // CASE ONE: Adding new howls at the TOP
                howlTemplates.forEach(element => {
                    // if something after howlsHeader, put it before that
                    if (howlsHeader.nextSibling) {
                        howlsHeader.parentNode.insertBefore(element, howlsHeader.nextSibling);
                    } 
                    else {
                        howlsHeader.parentNode.appendChild(element);
                    }
                });

                // There are no other cases lol
            });
    }



    // FUNCTION 2: Updating how the Follow button LOOKS ONLY
    function updateFollowButton() {

        // if this is your profile, hide the follow button
        const followButton = document.querySelector('.follow-button');
        if (currentUser.id === profileUser.id) {
            followButton.style.display = 'none';
            return;
        }

        // get a specific user's following list 
        fetch(`/api/users/${currentUser.id}/following`)
            .then(response => response.json())
            .then(following => {
                // making an isFollowing variable
                const isFollowing = following.includes(profileUser.id);
                followButton.textContent = isFollowing ? 'Unfollow' : 'Follow';
                followButton.onclick = () => handleFollowClick(isFollowing);
            });
    }

    // FUNCTION 3: Handling LOGIC behind following/unfollowing
    function handleFollowClick(isFollowing) {
        // isFollowing = you should unfollow
        const action = isFollowing ? 'unfollow' : 'follow';
        fetch(`/api/users/${profileUser.id}/${action}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(() => updateFollowButton());
    }

    // FUNCTION 4: Displaying the user's follwoing list
    function displayFollowing() {
        // Step 1: Get their following
        fetch(`/api/users/${profileUser.id}/following`)
            .then(response => response.json())
            .then(following => {
                const followsList = document.querySelector('.follows-list');
                followsList.innerHTML = '';

                // Step 2: Make the HTML for EACH user in the following
                Promise.all(following.map(userId => 
                    fetch(`/api/users/${userId}`).then(res => res.json())
                )).then(users => {
                    users.forEach(user => {
                        const followAccount = document.createElement('div');
                        followAccount.className = 'follow-account';
                        followAccount.innerHTML = `
                            <img src="${user.avatar}" alt="${user.username} PFP" class="avatar">
                            <div class="follow-info">
                                <span class="name">${user.first_name} ${user.last_name}</span>
                                <span class="handle">@${user.username}</span>
                            </div>
                        `;
                        // you can redirect to that user account
                        followAccount.onclick = () => window.location.href = `/user/${user.username}`;
                        followsList.appendChild(followAccount);
                    });
                });
            });
    }



    // FUNCTION 5: Formatting the date, called from displayHowls
    function formatDate(dateString) {
        // 2020-09-09T22:17:44Z
        // Wed Sep 09 2020 18:17:44 GMT-0400 (Eastern Daylight Time)
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const newHour = hour % 12 || 12;
        const newMinute = minute.toString().padStart(2, '0');
        const pm = hour >= 12 ? 'pm' : 'am';
        
        return `${month} ${day}, ${year} ${newHour}:${newMinute}${pm}`;
    }




    // PART 2: Get the user's initial following feed
    fetch('/api/users/current')
    // Step 1: Save the current user
    .then(response => response.json())
    .then(user => {
        currentUser = user;
        // Update navbar with current user info
        document.querySelector('.your-handle').textContent = `@${currentUser.username}`;
        document.querySelector('.user-profile img').src = currentUser.avatar;
        // make the user profile clickable
        const userProfile = document.querySelector('.user-profile');
        userProfile.onclick = () => window.location.href = `/user/${currentUser.username}`;

        // Get the user of the page being looked at
        return fetch(`/api/users/username/${username}`);
    })
    // Step 2: Save the user of the page being looked at
    .then(response => response.json())
    .then(user => {
        profileUser = user;
        document.querySelector('.profile-avatar').src = profileUser.avatar;
        document.querySelector('.profile-name').textContent = `${profileUser.first_name} ${profileUser.last_name}`;
        document.querySelector('.profile-handle').textContent = `@${profileUser.username}`;

        updateFollowButton();
        displayFollowing();

        // Get their HOWLS next
        return fetch(`/api/users/${profileUser.id}/howls`);
    })
    // Step 3: Get the user's howls
    .then(response => response.json())
    .then(howls => {
        displayHowls(howls);
    })
    .catch(error => console.error('Error:', error));

});