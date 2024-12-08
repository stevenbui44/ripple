document.getElementById('loginForm').addEventListener('submit', function(e) {
    
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
});