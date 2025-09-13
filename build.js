// Build script for Vercel deployment
// This replaces placeholders with environment variables

const fs = require('fs');
const path = require('path');

console.log('🔧 Building for Vercel deployment...');

// Read the script file
const scriptPath = path.join(__dirname, 'js', 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set in Vercel dashboard');
    process.exit(1);
}

// Replace placeholders with actual values
scriptContent = scriptContent.replace('__SUPABASE_URL__', supabaseUrl);
scriptContent = scriptContent.replace('__SUPABASE_ANON_KEY__', supabaseKey);

// Write the updated script
fs.writeFileSync(scriptPath, scriptContent);

console.log('✅ Environment variables injected successfully');
console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`);