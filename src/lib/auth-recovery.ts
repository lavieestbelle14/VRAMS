/**
 * Auth Recovery Utility
 * 
 * This utility helps recover from authentication issues like refresh token errors
 */

import { supabase } from '@/lib/supabase/client';

export async function clearCorruptedSession() {
  try {
    console.log('Clearing potentially corrupted session...');
    
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear localStorage keys that might contain corrupted data
    if (typeof window !== 'undefined') {
      const authKeys = [
        'vrams_auth_token',
        'sb-kfygqxwitopkherzcfjr-auth-token',
        'supabase.auth.token'
      ];
      
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn(`Could not clear storage key: ${key}`, e);
        }
      });
    }
    
    console.log('Session cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
}

export async function validateSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // Check if session is expired
    if (session.expires_at && session.expires_at < Date.now() / 1000) {
      console.log('Session expired');
      return false;
    }
    
    console.log('Session is valid');
    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}
