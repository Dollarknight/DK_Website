document.addEventListener('DOMContentLoaded', () => {
    const ctaButton = document.querySelector('.cta-button');

    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Thank you for your interest! The app is coming soon.');
        });
    }
});
