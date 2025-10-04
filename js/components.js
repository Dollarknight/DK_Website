// Component loader for header and footer — tries multiple candidate paths so it works
// when the host page is at root (/) or inside the `html/` folder.
async function loadComponent(elementId, candidatePaths) {
    const paths = Array.isArray(candidatePaths) ? candidatePaths : [candidatePaths];
    let lastError = null;
    for (const filePath of paths) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                lastError = new Error(`Failed to load ${filePath}: ${response.status} ${response.statusText}`);
                continue;
            }
            const html = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            }
            return; // success
        } catch (error) {
            lastError = error;
            // try next candidate
        }
    }
    console.error('Error loading component. Tried paths:', paths, 'last error:', lastError);
}

// Load header and footer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Try a few likely locations so includes work from root pages and pages inside `html/`.
    // Try the most-local locations first so pages inside `html/` (like pricing.html)
    // find `header.html`/`footer.html` in the same folder. Fall back to common root paths.
    const headerCandidates = ['header.html', './header.html', 'html/header.html', '../html/header.html', '/html/header.html'];
    const footerCandidates = ['footer.html', './footer.html', 'html/footer.html', '../html/footer.html', '/html/footer.html'];
    loadComponent('header-placeholder', headerCandidates);
    loadComponent('footer-placeholder', footerCandidates);
});