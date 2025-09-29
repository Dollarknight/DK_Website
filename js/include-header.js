// Dynamically load the header from html/header.html into #header-include
window.addEventListener('DOMContentLoaded', function() {
    var headerDiv = document.getElementById('header-include');
    if (headerDiv) {
        fetch('html/header.html')
            .then(function(response) { return response.text(); })
            .then(function(html) {
                headerDiv.innerHTML = html;
                // attach handlers immediately after injection
                try { attachDropdownHandlers(); } catch (e) { /* ignore until function defined on load */ }
                // small retry in case elements are still being parsed
                setTimeout(function() {
                    try { attachDropdownHandlers(); } catch (e) {}
                }, 120);
            });
    }
});

// After header is injected, set up mobile-friendly dropdown toggles (handles touch/click)
// Define attachDropdownHandlers in a scope accessible by earlier injection code
var attachDropdownHandlers = function() {
    var toggles = document.querySelectorAll('.dropdown-toggle');
    toggles.forEach(function(toggle) {
        var parent = toggle.closest('.dropdown');
        if (!parent) return;
        // prevent duplicate listeners
        if (parent.__dropdownHandlerAttached) return;

        toggle.addEventListener('click', function(e) {
            // on touch/click, toggle open class instead of navigating
            e.preventDefault();
            var isOpen = parent.classList.contains('open');
            // close any other open dropdowns
            document.querySelectorAll('.dropdown.open').forEach(function(d) {
                if (d !== parent) d.classList.remove('open');
            });
            if (isOpen) {
                parent.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                parent.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
        parent.__dropdownHandlerAttached = true;
    });
};

// Fallback: ensure handlers are attached on window load as well
window.addEventListener('load', function() {
    attachDropdownHandlers();
    setTimeout(attachDropdownHandlers, 300);
});

// Global delegation: handle toggle clicks and outside clicks reliably
document.addEventListener('click', function(e) {
    var toggle = e.target.closest('.dropdown-toggle');
    if (toggle) {
        e.preventDefault();
        var parent = toggle.closest('.dropdown');
        if (!parent) return;
        var isOpen = parent.classList.contains('open');
        // close other open dropdowns
        document.querySelectorAll('.dropdown.open').forEach(function(d) {
            if (d !== parent) d.classList.remove('open');
        });
        if (isOpen) {
            parent.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            parent.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
        }
        return;
    }

    // If click happened outside any .dropdown, close open dropdowns
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.open').forEach(function(d) {
            d.classList.remove('open');
            var t = d.querySelector('.dropdown-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
        });
    }
});

// Close dropdowns on Escape key for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        document.querySelectorAll('.dropdown.open').forEach(function(d) {
            d.classList.remove('open');
            var t = d.querySelector('.dropdown-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
        });
    }
});
