const Navbar = () => {
    return (
        <nav className="navbar sticky-top">
            <h1 className="howler navbar-brand mb-2 text-white">Ripple</h1>
            <div className="user-profile">
                {/* <span className="your-handle">@student</span>
                <img src="../static/images/student-pfp.jpg" alt="Student PFP" className="avatar" /> */}
            </div>
        </nav>
    );
};

const LoginForm = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid username');
            }
            return response.json();
        })
        .then(() => {
            window.location.href = '/';
        })
        .catch(error => {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.textContent = 'Invalid username. Please try again.';
        });
    };

    return (
        <div className="login-container">
            <h2 className="login-header fw-bold">Log In</h2>
            <form className="login-form" id="loginForm" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        className="login-input" 
                        placeholder="Enter your username" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        className="login-input" 
                        placeholder="Enter your password" 
                        required 
                    />
                </div>
                <button type="submit" className="login-button">Log In</button>
                <p id="errorMessage"></p>
            </form>
        </div>
    );
};

const App = () => {
    return (
        <div>
            <Navbar />
            <main>
                <LoginForm />
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);