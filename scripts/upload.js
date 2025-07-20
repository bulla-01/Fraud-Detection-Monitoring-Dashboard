document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const messageContainer = document.getElementById('messageContainer');

    // Handle form submission
    uploadForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const file = fileInput.files[0];

        if (!file) {
            displayMessage('Please select a file to upload.', 'error');
            return;
        }

        if (!isValidFile(file)) {
            displayMessage('Invalid file type. Only .csv, .xls, and .xlsx files are allowed.', 'error');
            return;
        }

        // Simulate file upload (you can replace this with actual server upload code)
        uploadFile(file)
            .then(() => {
                displayMessage('File uploaded successfully!', 'success');
            })
            .catch(() => {
                displayMessage('Error uploading the file. Please try again.', 'error');
            });
    });

    // Validate file type (e.g., CSV, XLS, XLSX)
    function isValidFile(file) {
        const allowedTypes = ['csv', 'xls', 'xlsx'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        return allowedTypes.includes(fileExtension);
    }

    // Simulate a file upload (Replace with actual file upload logic)
    function uploadFile(file) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate either success or error
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
