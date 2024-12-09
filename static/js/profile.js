const Navbar = ({ currentUser }) => {
    if (!currentUser) return null;

    return (
        <nav className="navbar sticky-top">
            <h1 
                className="howler navbar-brand mb-2 text-white" 
                onClick={() => window.location.href='/'}
            >
                Ripple
            </h1>
            <div 
                className="user-profile"
                onClick={() => window.location.href = `/user/${currentUser.username}`}
            >
                <span className="your-handle">@{currentUser.username}</span>
                <img src={currentUser.avatar} alt="Current User PFP" className="avatar" />
            </div>
        </nav>
    );
};

const ProfileHeader = ({ profileUser, currentUser, onFollowUpdate }) => {
    const [isFollowing, setIsFollowing] = React.useState(false);

    React.useEffect(() => {
        if (currentUser && profileUser) {
            fetch(`/api/users/${currentUser.id}/following`)
                .then(response => response.json())
                .then(following => {
                    setIsFollowing(following.includes(profileUser.id));
                });
        }
    }, [currentUser, profileUser]);

    const handleFollowClick = () => {
        const action = isFollowing ? 'unfollow' : 'follow';
        fetch(`/api/users/${profileUser.id}/${action}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(() => {
            setIsFollowing(!isFollowing);
            if (onFollowUpdate) onFollowUpdate();
        });
    };

    if (!profileUser || !currentUser) return null;

    return (
        <div className="profile-header">
            <div className="profile-info">
                <img src={profileUser.avatar} alt="User PFP" className="profile-avatar" />
                <div className="profile-left-side">
                    <h2 className="profile-name">
                        {profileUser.first_name} {profileUser.last_name}
                    </h2>
                    <span className="profile-handle">@{profileUser.username}</span>
                </div>
            </div>
            {currentUser.id !== profileUser.id && (
                <button 
                    className="follow-button"
                    onClick={handleFollowClick}
                >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            )}
        </div>
    );
};

const FollowingList = ({ profileUser }) => {
    const [following, setFollowing] = React.useState([]);

    React.useEffect(() => {
        if (profileUser) {
            fetch(`/api/users/${profileUser.id}/following`)
                .then(response => response.json())
                .then(followingIds => {
                    return Promise.all(
                        followingIds.map(userId => 
                            fetch(`/api/users/${userId}`).then(res => res.json())
                        )
                    );
                })
                .then(users => setFollowing(users));
        }
    }, [profileUser]);

    if (!profileUser) return null;

    return (
        <div className="follows-section">
            <h3 className="follows-header">Follows:</h3>
            <div className="follows-list">
                {following.map(user => (
                    <div 
                        key={user.id}
                        className="follow-account"
                        onClick={() => window.location.href = `/user/${user.username}`}
                    >
                        <img src={user.avatar} alt={`${user.username} PFP`} className="avatar" />
                        <div className="follow-info">
                            <span className="name">{user.first_name} {user.last_name}</span>
                            <span className="handle">@{user.username}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Howl = ({ howl, user }) => {
    const formatDate = (dateString) => {
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
    };

    // Don't render if we don't have user data yet
    if (!user) return null;

    return (
        <div className="howl">
            <div 
                className="howl-header" 
                onClick={() => window.location.href=`/user/${user.username}`}
            >
                <img src={user.avatar} alt={`${user.username} PFP`} className="avatar" />
                <div className="user-info">
                    <span className="name">{user.first_name} {user.last_name} </span>
                    <span className="handle">@{user.username}</span>
                </div>
                <span className="time">{formatDate(howl.datetime)}</span>
            </div>
            <p className="howl-message">{howl.text}</p>
        </div>
    );
};


const HowlsList = ({ profileUser }) => {
    const [howls, setHowls] = React.useState([]);
    const [users, setUsers] = React.useState({});

    React.useEffect(() => {
        if (profileUser) {
            fetch(`/api/users/${profileUser.id}/howls`)
                .then(response => response.json())
                .then(howlsData => {
                    // Original howls order
                    setHowls(howlsData.reverse());  // Reverse to match original order
                    const uniqueUserIds = [...new Set(howlsData.map(h => h.userId))];
                    return Promise.all(
                        uniqueUserIds.map(userId =>
                            fetch(`/api/users/${userId}`).then(res => res.json())
                        )
                    );
                })
                .then(usersData => {
                    const newUsers = {};
                    usersData.forEach(user => {
                        newUsers[user.id] = user;
                    });
                    setUsers(newUsers);
                });
        }
    }, [profileUser]);

    if (!profileUser) return null;

    return (
        <div className="howls-container">
            <h2 className="howls-header">Posts:</h2>
            {howls.map(howl => (
                <Howl 
                    key={howl.id || Math.random()} 
                    howl={howl} 
                    user={users[howl.userId]}
                />
            ))}
        </div>
    );
};

const App = () => {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [profileUser, setProfileUser] = React.useState(null);
    const username = window.location.pathname.split('/')[2];

    React.useEffect(() => {
        // Get current user and profile user data
        fetch('/api/users/current')
            .then(response => response.json())
            .then(user => {
                setCurrentUser(user);
                return fetch(`/api/users/username/${username}`);
            })
            .then(response => response.json())
            .then(user => {
                setProfileUser(user);
            })
            .catch(error => console.error('Error:', error));
    }, [username]);

    const handleFollowUpdate = () => {
        // Refresh following list when follow status changes
        if (profileUser) {
            fetch(`/api/users/username/${username}`)
                .then(response => response.json())
                .then(user => {
                    setProfileUser(user);
                });
        }
    };

    if (!currentUser || !profileUser) return null;

    return (
        <div>
            <Navbar currentUser={currentUser} />
            <main>
                <ProfileHeader 
                    profileUser={profileUser} 
                    currentUser={currentUser} 
                    onFollowUpdate={handleFollowUpdate}
                />
                <FollowingList profileUser={profileUser} />
                <HowlsList profileUser={profileUser} />
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
