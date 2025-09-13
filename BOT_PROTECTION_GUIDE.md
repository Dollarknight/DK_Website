# Bot Protection Implementation Guide

## ✅ Client-Side Protection (Implemented)

### 1. Enhanced Email Validation
- Comprehensive regex pattern following RFC 5322
- Length validation (max 254 characters)
- Blocks consecutive dots and edge cases
- Basic disposable email domain filtering

### 2. Honeypot Field
- Hidden field that only bots can see and fill
- Silently rejects submissions if filled
- Invisible to human users via CSS

### 3. Client-Side Rate Limiting
- Max 3 attempts per minute per browser
- 5-minute cooldown after hitting limit
- Uses localStorage for tracking

### 4. Google reCAPTCHA v3 Integration
- Invisible to users, analyzes behavior
- Provides risk score for each submission
- **SETUP REQUIRED**: Replace `YOUR_SITE_KEY` with your actual key

## 🚨 Server-Side Protection (REQUIRED)

### 1. IP-Based Rate Limiting (Supabase Edge Function)

```sql
-- Create a table to track IP submissions
CREATE TABLE IF NOT EXISTS ip_rate_limits (
    ip_address TEXT PRIMARY KEY,
    submission_count INTEGER DEFAULT 0,
    last_submission TIMESTAMP DEFAULT NOW(),
    blocked_until TIMESTAMP NULL
);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_ip_rate_limit(ip_addr TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    last_sub TIMESTAMP;
    blocked_until TIMESTAMP;
BEGIN
    SELECT submission_count, last_submission, blocked_until 
    INTO current_count, last_sub, blocked_until
    FROM ip_rate_limits 
    WHERE ip_address = ip_addr;
    
    -- If IP is blocked, check if block period has expired
    IF blocked_until IS NOT NULL AND blocked_until > NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Reset count if last submission was more than 1 hour ago
    IF last_sub IS NULL OR last_sub < NOW() - INTERVAL '1 hour' THEN
        current_count := 0;
    END IF;
    
    -- Block if more than 5 submissions in 1 hour
    IF current_count >= 5 THEN
        UPDATE ip_rate_limits 
        SET blocked_until = NOW() + INTERVAL '24 hours'
        WHERE ip_address = ip_addr;
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 2. Update Your Supabase Edge Function

```javascript
// In your save_waitlist edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { name, email, recaptcha_token, user_agent } = await req.json()
    
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // 1. Check IP rate limit
    const { data: rateLimitCheck } = await supabase
      .rpc('check_ip_rate_limit', { ip_addr: clientIP })
    
    if (!rateLimitCheck) {
      return new Response(
        JSON.stringify({ error: 'Too many requests from this IP' }),
        { status: 429 }
      )
    }
    
    // 2. Verify reCAPTCHA
    if (recaptcha_token) {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${Deno.env.get('RECAPTCHA_SECRET_KEY')}&response=${recaptcha_token}`
      })
      
      const recaptchaResult = await recaptchaResponse.json()
      if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
        return new Response(
          JSON.stringify({ error: 'Verification failed' }),
          { status: 400 }
        )
      }
    }
    
    // 3. Additional validations
    // Check for suspicious patterns
    if (name.length > 100 || email.length > 254) {
      return new Response(
        JSON.stringify({ error: 'Invalid input length' }),
        { status: 400 }
      )
    }
    
    // Check for duplicate emails
    const { data: existingUser } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409 }
      )
    }
    
    // 4. Update IP tracking
    await supabase
      .from('ip_rate_limits')
      .upsert({
        ip_address: clientIP,
        submission_count: 1,
        last_submission: new Date().toISOString()
      }, {
        onConflict: 'ip_address',
        ignoreDuplicates: false
      })
    
    // 5. Save to waitlist
    const { error } = await supabase
      .from('waitlist')
      .insert({
        name,
        email,
        ip_address: clientIP,
        user_agent,
        created_at: new Date().toISOString()
      })
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ message: 'Successfully added to waitlist' }),
      { status: 200 }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

### 3. Additional Database Schema

```sql
-- Add columns to your waitlist table
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS verification_score DECIMAL;

-- Create index for faster IP lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_ip ON waitlist(ip_address);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
```

## 🔧 Setup Instructions

### 1. Google reCAPTCHA Setup
1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin/)
2. Create a new site with reCAPTCHA v3
3. Add your domain (e.g., `dollarknight.com`)
4. Get your Site Key and Secret Key
5. Replace `YOUR_SITE_KEY` in the HTML and JavaScript files
6. Add Secret Key to your Supabase environment variables

### 2. Environment Variables (Supabase)
Add these to your Supabase Edge Function environment:
```
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### 3. Additional Recommendations

#### Cloudflare (Recommended)
- Use Cloudflare for additional DDoS protection
- Enable Bot Fight Mode
- Set up custom firewall rules

#### Monitoring
- Set up alerts for unusual submission patterns
- Monitor IP addresses with high submission rates
- Log suspicious activities

#### Email Validation Service
Consider integrating with services like:
- EmailJS for real-time email validation
- Abstract API for disposable email detection
- Hunter.io for email verification

## 🔍 Monitoring Queries

```sql
-- Check for suspicious IPs
SELECT ip_address, COUNT(*) as submission_count
FROM waitlist 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address 
HAVING COUNT(*) > 5
ORDER BY submission_count DESC;

-- Check for duplicate names/emails
SELECT email, COUNT(*) as count
FROM waitlist 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Monitor submission patterns
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as submissions
FROM waitlist 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour 
ORDER BY hour DESC;
```

## ⚠️ Important Notes

1. **Legal Compliance**: Ensure GDPR/CCPA compliance when storing IP addresses
2. **Privacy**: Consider anonymizing IP addresses after a period
3. **Testing**: Test all protections thoroughly before deployment
4. **Monitoring**: Set up proper logging and alerting
5. **Updates**: Keep reCAPTCHA and other security measures updated