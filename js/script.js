document.addEventListener('DOMContentLoaded', () => {
    // Rate limiting and tracking variables
    const RATE_LIMIT_WINDOW = 60000; // 1 minute
    const MAX_ATTEMPTS = 3; // Max 3 attempts per minute
    const COOLDOWN_PERIOD = 300000; // 5 minutes cooldown after rate limit hit
    
    // Get submission history from localStorage
    function getSubmissionHistory() {
        const history = localStorage.getItem('dk_submission_history');
        return history ? JSON.parse(history) : [];
    }
    
    // Save submission attempt
    function recordSubmissionAttempt() {
        const history = getSubmissionHistory();
        const now = Date.now();
        history.push(now);
        
        // Clean old entries (older than rate limit window)
        const recentHistory = history.filter(timestamp => 
            now - timestamp < RATE_LIMIT_WINDOW
        );
        
        localStorage.setItem('dk_submission_history', JSON.stringify(recentHistory));
        return recentHistory.length;
    }
    
    // Check if rate limited
    function isRateLimited() {
        const history = getSubmissionHistory();
        const now = Date.now();
        
        // Check for recent attempts within the window
        const recentAttempts = history.filter(timestamp => 
            now - timestamp < RATE_LIMIT_WINDOW
        );
        
        // Check for cooldown period
        const lastAttempt = Math.max(...history, 0);
        if (recentAttempts.length >= MAX_ATTEMPTS && 
            now - lastAttempt < COOLDOWN_PERIOD) {
            return { 
                limited: true, 
                remaining: Math.ceil((COOLDOWN_PERIOD - (now - lastAttempt)) / 1000) 
            };
        }
        
        return { 
            limited: recentAttempts.length >= MAX_ATTEMPTS, 
            remaining: 0 
        };
    }

    // Waitlist form logic
    const waitlistForm = document.getElementById('waitlist-form');
    const waitlistName = document.getElementById('waitlist-name');
    const waitlistEmail = document.getElementById('waitlist-email');
    const honeypotField = document.getElementById('website');
    const waitlistMessage = document.getElementById('waitlist-message');

    function isValidEmail(email) {
        // More comprehensive email validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        // Basic format check
        if (!emailRegex.test(email)) return false;
        
        // Additional checks
        if (email.length > 254) return false; // RFC 5322 limit
        if (email.includes('..')) return false; // No consecutive dots
        if (email.startsWith('.') || email.endsWith('.')) return false; // No dots at start/end
        
        // Check for common disposable email domains (basic list)
        const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com', 'mailinator.com'];
        const domain = email.split('@')[1].toLowerCase();
        if (disposableDomains.includes(domain)) return false;
        
        return true;
    }

    function isValidName(name) {
        // Allow only letters, spaces, hyphens, apostrophes, and periods, 2-50 chars
        return /^[A-Za-z .'-]{2,50}$/.test(name);
    }

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Rate limiting check
            const rateLimitStatus = isRateLimited();
            if (rateLimitStatus.limited) {
                waitlistMessage.textContent = rateLimitStatus.remaining > 0 
                    ? `⏰ Too many attempts. Please wait ${rateLimitStatus.remaining} seconds.`
                    : '⏰ Too many attempts. Please wait a few minutes before trying again.';
                waitlistMessage.style.color = 'orange';
                return;
            }
            
            // Honeypot check - if filled, it's likely a bot
            if (honeypotField.value.trim() !== '') {
                console.log('Bot detected: honeypot field filled');
                // Silently fail for bots (don't show error message)
                return;
            }
            
            // Record submission attempt
            const attemptCount = recordSubmissionAttempt();
            
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
                    body: JSON.stringify({ 
                        name, 
                        email,
                        user_agent: navigator.userAgent,
                        timestamp: new Date().toISOString()
                    })
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
