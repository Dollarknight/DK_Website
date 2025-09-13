document.addEventListener('DOMContentLoaded', () => {
    // Waitlist form logic
    const waitlistForm = document.getElementById('waitlist-form');
    const waitlistName = document.getElementById('waitlist-name');
    const waitlistEmail = document.getElementById('waitlist-email');
    const waitlistMessage = document.getElementById('waitlist-message');

    function isValidEmail(email) {
        // Basic email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidName(name) {
        // Allow only letters, spaces, hyphens, apostrophes, and periods, 2-50 chars
        return /^[A-Za-z .'-]{2,50}$/.test(name);
    }

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = waitlistName.value.trim();
            const email = waitlistEmail.value.trim();
            if (!isValidName(name)) {
                waitlistMessage.textContent = 'Please enter a valid name (letters, spaces, 2-50 chars).';
                waitlistMessage.style.color = 'red';
                return;
            }
            if (!isValidEmail(email)) {
                waitlistMessage.textContent = 'Please enter a valid email.';
                waitlistMessage.style.color = 'red';
                return;
            }
            waitlistMessage.textContent = 'Submitting...';
            waitlistMessage.style.color = '';
            try {
                // Dynamically import Supabase client
                const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('./supabaseConfig.js');
                const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
                const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                const { error } = await supabase.from('email_list').insert([{ name, email }]);
                if (error) {
                    throw error;
                }
                waitlistMessage.textContent = 'Thank you! You have been added to the waitlist.';
                waitlistMessage.style.color = 'green';
                waitlistForm.reset();
            } catch (err) {
                waitlistMessage.textContent = 'There was an error. Please try again later.';
                waitlistMessage.style.color = 'red';
            }
        });
    }
});
