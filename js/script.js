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
                // Replace with your actual Supabase project URL
                const SUPABASE_URL = 'https://ihugoyrccdnrtpubanpm.supabase.co';
                const response = await fetch(`${SUPABASE_URL}/functions/v1/save_waitlist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email })
                });
                
                const data = await response.json();
                const messageDiv = waitlistMessage;
                
                console.log('Response status:', response.status);
                console.log('Response data:', data);
                
                if (response.ok) {
                    messageDiv.textContent = "🎉 You're on the waitlist!";
                    messageDiv.style.color = 'green';
                    document.getElementById("waitlist-form").reset();
                } else {
                    messageDiv.textContent = "❌ " + (data.error || "Something went wrong");
                    messageDiv.style.color = 'red';
                }
            } catch (err) {
                console.error('Waitlist submission failed:', err);
                waitlistMessage.textContent = "❌ Network error. Please try again later.";
                waitlistMessage.style.color = 'red';
            }
        });
    }
});
