import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const signUp = async (email: string, password: string) => {
  try {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
  } catch (error) {
    console.error('SignUp error:', error);
    return { data: null, error: { message: 'Network error during sign up. Please check your Supabase configuration.' } };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
  } catch (error) {
    console.error('SignIn error:', error);
    return { data: null, error: { message: 'Network error during sign in. Please check your Supabase configuration.' } };
  }
};

export const signOut = async () => {
  try {
  const { error } = await supabase.auth.signOut();
  return { error };
  } catch (error) {
    console.error('SignOut error:', error);
    return { error: { message: 'Network error during sign out' } };
  }
};

export const getCurrentUser = async () => {
  try {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
  } catch (error) {
    console.error('GetCurrentUser error:', error);
    return { user: null, error: { message: 'Network error getting user' } };
  }
};