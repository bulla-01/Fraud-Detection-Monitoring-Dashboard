document.addEventListener('DOMContentLoaded', () => {
    // Navbar
    document.getElementById('navbar').innerHTML = `
      <nav class="navbar">
        <a href="dasboard.html" id="nav-dashboard">Dashboard</a>
        <a href="feedback.html" id="nav-feedback">Feedback</a>
        <a href="upload.html" id="nav-upload">Upload</a>
      </nav>
    `;

    // Footer
    document.getElementById('footer').innerHTML = `
      <footer class="footer">
        <p>© 2025 Neon Dashboard. All rights reserved.</p>
      </footer>
    `;

    // Highlight Active Page
    const path = window.location.pathname.split('/').pop();
    if (path.includes('feedback')) {
        document.getElementById('nav-feedback').classList.add('active');
    } else if (path.includes('upload')) {
        document.getElementById('nav-upload').classList.add('active');
    } else {
        document.getElementById('nav-dashboard').classList.add('active');
    }
});
