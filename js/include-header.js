// Dynamically load the header from html/header.html into #header-include
window.addEventListener('DOMContentLoaded', function() {
    var headerDiv = document.getElementById('header-include');
    if (headerDiv) {
        fetch('html/header.html')
            .then(function(response) { return response.text(); })
            .then(function(html) { headerDiv.innerHTML = html; });
    }
});
