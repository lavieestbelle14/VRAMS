/**
 * Environment Configuration Checker
 * 
 * This utility helps verify that the required environment variables
 * are properly configured for VRAMS authentication flows.
 */

export function checkEnvironmentConfig() {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };

  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing);
    console.warn('📝 Please check your .env.local file and ensure all required variables are set.');
    return false;
  }

  // Additional validation for SITE_URL format
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && !siteUrl.startsWith('http')) {
    console.warn('⚠️  NEXT_PUBLIC_SITE_URL should start with http:// or https://');
    return false;
  }

  console.log('✅ All environment variables are properly configured');
  console.log('🔗 Site URL:', siteUrl);
  console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  return true;
}

// Auto-check in development mode
if (process.env.NODE_ENV === 'development') {
  checkEnvironmentConfig();
}
