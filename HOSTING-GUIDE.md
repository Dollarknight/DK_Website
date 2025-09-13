# Vercel Deployment Guide

## 🚀 Vercel Setup (Current Setup)

### 1. **Environment Variables in Vercel Dashboard**
1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add these variables:
   - `SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-actual-anon-key`
4. Set for: Production, Preview, and Development

### 2. **Deployment Process**
```bash
# Automatic deployment on git push
git add .
git commit -m "Update waitlist functionality"
git push origin main

# Manual deployment with Vercel CLI
npm i -g vercel
vercel --prod
```

### 3. **Build Process**
- Vercel runs `npm run build` automatically
- Build script injects environment variables into `js/script.js`
- Replaces `__SUPABASE_URL__` and `__SUPABASE_ANON_KEY__` with actual values

### 4. **Vercel Configuration**
The `vercel.json` file configures:
- Build command: `npm run build`
- Output directory: `./` (root)
- Environment variable references

## 🛡️ Security Features
- ✅ Environment variables stored securely in Vercel
- ✅ Variables injected at build time (not runtime)
- ✅ Supabase RLS policies protect database
- ✅ No sensitive data in source code
- ✅ HTTPS automatically enabled

## 🔧 Troubleshooting

### Build Fails?
1. Check environment variables are set in Vercel dashboard
2. Ensure variable names match exactly: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Check build logs in Vercel dashboard

### Waitlist Not Working?
1. Check browser console for errors
2. Verify Supabase RLS policies are applied
3. Test Supabase connection in Supabase dashboard
4. Check if email_list table exists

### Environment Variables Not Loading?
1. Redeploy after setting variables
2. Check variable names are correct
3. Ensure variables are set for correct environment (Production)

## � Pre-deployment Checklist
- ✅ Supabase database configured with RLS policies
- ✅ Environment variables set in Vercel dashboard  
- ✅ Repository connected to Vercel
- ✅ Build command configured
- ✅ Domain configured (if using custom domain)