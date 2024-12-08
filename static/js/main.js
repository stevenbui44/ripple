document.addEventListener('DOMContentLoaded', () => {

    // FUNCTION 1: Showing all howls
    // howls:
    // {
    //     "id": 1,
    //     "userId": 7,
    //     "datetime": "2020-05-29T03:50:25Z",
    //     "text": "Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros. Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat."
    // },
    // prepend: whether new howls get added to the TOP or BOTTOM
    function displayHowls(howls, prepend) {
        
        // posting everything after whats-howling
        const whatsHowling = document.querySelector('.whats-howling');

        // Function for when the Promise goes through each howl in howls
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
                if (prepend) {
                    howlTemplates.forEach(element => {
                        // if something after whatsHowling, put it before that
                        if (whatsHowling.nextSibling) {
                            whatsHowling.parentNode.insertBefore(element, whatsHowling.nextSibling);
                        } 
                        else {
                            whatsHowling.parentNode.appendChild(element);
                        }
                    });
                } 
                // CASE TWO: Adding existing howls to the BOTTOM
                else {
                    // Add all howls after the "What's howling" box
                    howlTemplates.reverse().forEach(element => {
                        if (whatsHowling.nextSibling) {
                            whatsHowling.parentNode.insertBefore(element, whatsHowling.nextSibling);
                        } 
                        else {
                            whatsHowling.parentNode.appendChild(element);
                        }
                    });
                }
            });
    }






    // FUNCTION 2: Posting a new howl
    function createHowl() {

        // the text area with the message
        const textArea = document.querySelector('.howl-input');
        
        // STEP 1: Get the message
        const howlText = textArea.value.trim();
        if (howlText === '') 
            return;

        // STEP 2: Call POST /howls with body
        fetch('/api/howls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: howlText })
        })

        // STEP 3: Turn the response to JSON
        .then(response => response.json())

        // STEP 4: Put the new howl at the top
        .then(newHowl => {
            textArea.value = '';
            const howlJSON = {
                userId: newHowl.userId,
                text: newHowl.text,
                datetime: newHowl.datetime
            };
            displayHowls([howlJSON], true);
        })
        .catch(error => console.error('Error:', error));
    }





    // FUNCTION 3: Formatting the date, called from displayHowls
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
        .then(currentUser => {
            // Update navbar with current user info
            document.querySelector('.your-handle').textContent = `@${currentUser.username}`;
            document.querySelector('.user-profile img').src = currentUser.avatar;

            // make the user profile clickable
            const userProfile = document.querySelector('.user-profile');
            userProfile.onclick = () => window.location.href = `/user/${currentUser.username}`;
            
            // Get howls from people the user follows
            return fetch('/api/howls/following');
        })
        // Step 2: Save the feed of the current user
        .then(response => response.json())
        .then(howls => {
            displayHowls(howls);
        })
        .catch(error => console.error('Error:', error));



        
    // Add event listener for the Howl button
    document.querySelector('.howl-button').addEventListener('click', createHowl);
});