const Navbar = ({ currentUser }) => {
    const username = currentUser ? currentUser.username : '';
    const avatar = currentUser ? currentUser.avatar : '#';

    return (
        <nav className="navbar sticky-top">
            <h1 
                className="howler navbar-brand mb-2 text-white" 
                onClick={() => window.location.href='/'}
            >
                Howler
            </h1>
            <div 
                className="user-profile d-flex"
                onClick={() => window.location.href = `/user/${username}`}
            >
                <span className="your-handle text-white">@{username}</span>
                <img src={avatar} alt="Current User PFP" className="avatar" />
            </div>
        </nav>
    );
};

const WhatsHowling = ({ onNewHowl }) => {
    const [howlText, setHowlText] = React.useState('');

    const createHowl = () => {
        const trimmedText = howlText.trim();
        if (trimmedText === '') return;

        fetch('/api/howls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: trimmedText })
        })
        .then(response => response.json())
        .then(newHowl => {
            setHowlText('');
            onNewHowl({
                userId: newHowl.userId,
                text: newHowl.text,
                datetime: newHowl.datetime
            });
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div className="whats-howling">
            <div className="input-area">
                <textarea 
                    className="howl-input" 
                    placeholder="What's howling?"
                    value={howlText}
                    onChange={(e) => setHowlText(e.target.value)}
                />
                <button className="howl-button" onClick={createHowl}>
                    Howl
                </button>
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

const HowlsList = ({ howls, users }) => {
    return (
        <div className="howls-list">
            {howls.map((howl, index) => (
                <Howl 
                    key={howl.id || index} 
                    howl={howl} 
                    user={users[howl.userId]}
                />
            ))}
        </div>
    );
};

const App = () => {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [howls, setHowls] = React.useState([]);
    const [users, setUsers] = React.useState({});

    React.useEffect(() => {
        // Get current user and their following feed
        fetch('/api/users/current')
            .then(response => response.json())
            .then(user => {
                setCurrentUser(user);
                setUsers(prev => {
                    const newUsers = {...prev};
                    newUsers[user.id] = user;
                    return newUsers;
                });
                return fetch('/api/howls/following');
            })
            .then(response => response.json())
            .then(howlsData => {
                setHowls(howlsData);
                // Fetch user data for each howl
                return Promise.all(
                    howlsData.map(howl => 
                        fetch(`/api/users/${howl.userId}`)
                            .then(response => response.json())
                    )
                );
            })
            .then(usersData => {
                const newUsers = {...users};
                usersData.forEach(user => {
                    newUsers[user.id] = user;
                });
                setUsers(newUsers);
            })
            .catch(error => console.error('Error:', error));
    }, []);

    const handleNewHowl = (newHowl) => {
        setHowls(prevHowls => [newHowl, ...prevHowls]);
    };

    return (
        <div>
            <Navbar currentUser={currentUser} />
            <main>
                <WhatsHowling onNewHowl={handleNewHowl} />
                <HowlsList howls={howls} users={users} />
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
