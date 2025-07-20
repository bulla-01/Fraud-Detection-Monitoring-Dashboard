document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const messageInput = document.getElementById('messageInput');
    const messageContainer = document.getElementById('messageContainer');

    // Handle form submission
    feedbackForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get input values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        // Basic validation
        if (!name || !email || !message) {
            displayMessage('Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            displayMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate sending feedback (you can replace this with actual server logic)
        sendFeedback({ name, email, message })
            .then(() => {
                displayMessage('Thank you for your feedback! We will get back to you shortly.', 'success');
                feedbackForm.reset(); // Reset the form after successful submission
            })
            .catch(() => {
                displayMessage('Error submitting feedback. Please try again later.', 'error');
            });
    });

    // Validate email format using a simple regex
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    // Simulate feedback submission (Replace with actual server logic)
    function sendFeedback(feedback) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const success = Math.random() > 0.2; // 80% success rate
                if (success) {
                    resolve();
                } else {
                    reject();
                }
            }, 1500); // Simulate delay
        });
    }

    // Display messages (success or error)
    function displayMessage(message, type) {
        messageContainer.innerHTML = `<p class="${type}">${message}</p>`;
    }
});
