// Component loader for header and footer
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Load header and footer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header-placeholder', 'html/header.html');
    loadComponent('footer-placeholder', 'html/footer.html');
});