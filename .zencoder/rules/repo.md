---
description: Repository Information Overview
alwaysApply: true
---

# Dollar Knight Landing Page Information

## Summary
Dollar Knight is a landing page for a budgeting app that helps users track spending, set savings goals, and manage subscriptions. The site includes a waitlist signup form, feature showcase, and blog section. It's designed to collect user information before the app's beta launch in October 2025.

## Structure
- **css/**: Contains styling files for the website
- **html/**: Contains reusable HTML components (header, footer)
- **icons/**: Contains logo assets and app store badges
- **js/**: Contains JavaScript functionality for the site
- **screenshots/**: Contains app screenshots for display
- **Root files**: Main HTML pages, Supabase configuration, and documentation

## Language & Runtime
**Language**: HTML, CSS, JavaScript
**Backend**: Supabase (PostgreSQL, Edge Functions)
**Deployment**: Vercel

## Key Components

### Frontend
**Main Pages**:
- `index.html`: Main landing page with waitlist form
- `blog.html`: Blog/about page
- `pricing.html`: Pricing information
- `success.html`: Confirmation page after waitlist signup

**Component Structure**:
- Header and footer components loaded dynamically
- Responsive design with mobile-friendly layout

### Backend (Supabase)
**Database Tables**:
- `email_list`: Stores waitlist signup information
- `ip_rate_limits`: Tracks submission attempts for rate limiting

**Edge Functions**:
- `save_waitlist`: Processes waitlist form submissions
- Security features: Rate limiting, input validation, honeypot fields

## Build & Deployment
**Deployment Platform**: Vercel
**Build Command**:
```bash
npm run build
```

**Environment Variables**:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous API key
- `RECAPTCHA_SECRET_KEY`: Google reCAPTCHA secret key (optional)

## Security Features
**Client-Side Protection**:
- Enhanced email validation
- Honeypot fields for bot detection
- Client-side rate limiting (3 attempts per minute)
- Google reCAPTCHA v3 integration (optional)

**Server-Side Protection**:
- IP-based rate limiting
- Row-Level Security (RLS) policies
- Input validation and sanitization
- Duplicate submission prevention

## Integration Points
**Supabase**:
- Database for storing waitlist information
- Edge functions for form processing
- RLS policies for data protection

**Google Analytics**:
- Tracking code integrated for visitor analytics
- Conversion tracking for waitlist signups

## Usage & Operations
**Local Development**:
- Serve files using a local web server
- Configure environment variables for Supabase connection

**Deployment Process**:
```bash
git add .
git commit -m "Update message"
git push origin main
```

**Monitoring**:
- SQL queries provided for monitoring suspicious activities
- Tracking submission patterns and potential abuse