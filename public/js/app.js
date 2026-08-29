// SafeNepal JavaScript

// Sidebar Toggle
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('show') && !sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    });
});

// CSRF Token setup for AJAX
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Geolocation helper
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    });
}

// Format distance
function formatDistance(meters) {
    if (meters < 1000) {
        return Math.round(meters) + ' m';
    }
    return (meters / 1000).toFixed(2) + ' km';
}

// Format time
function formatTime(minutes) {
    if (minutes < 60) {
        return Math.round(minutes) + ' min';
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours + 'h ' + mins + 'm';
}
