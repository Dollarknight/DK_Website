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
                // Replace with your actual Supabase project URL and anon key
                const SUPABASE_URL = 'https://ihugoyrccdnrtpubanpm.supabase.co';
                const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodWdveXJjY2RucnRwdWJhbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDI4MjcsImV4cCI6MjA3MTM3ODgyN30.eXVi_EOgr02dFJg8N9sHTkn9gQGKgNo9p4abczbZhLU'; // You need to add your anon key
                const functionUrl = `${SUPABASE_URL}/functions/v1/save_waitlist`;
                
                console.log('Attempting to fetch:', functionUrl);
                console.log('Payload:', { name, email });
                
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({ name, email })
                });
                
                const data = await response.json();
                const messageDiv = waitlistMessage;
                
                console.log('Response status:', response.status);
                console.log('Response data:', data);
                
                if (response.ok) {
                    messageDiv.textContent = "🎉 Redirecting...";
                    messageDiv.style.color = 'green';
                    document.getElementById("waitlist-form").reset();
                    
                    // Redirect to success page after a short delay
                    setTimeout(() => {
                        window.location.href = 'success.html';
                    }, 1000);
                } else {
                    messageDiv.textContent = "❌ " + (data.error || "Something went wrong");
                    messageDiv.style.color = 'red';
                }
            } catch (err) {
                console.error('Waitlist submission failed:', err);
                console.error('Error type:', err.name);
                console.error('Error message:', err.message);
                console.error('Full error:', err);
                
                // More specific error messages
                if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('NetworkError'))) {
                    waitlistMessage.textContent = "❌ Could not connect to server. Check your internet connection.";
                } else if (err.message.includes('CORS')) {
                    waitlistMessage.textContent = "❌ Server configuration error (CORS). Please contact support.";
                } else {
                    waitlistMessage.textContent = "❌ Network error: " + err.message;
                }
                waitlistMessage.style.color = 'red';
            }
        });
    }
});
