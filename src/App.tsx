import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase'; // adjust if path differs
import AuthForm from './components/auth/AuthForm';
import Dashboard from './components/dashboard/Dashboard';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? <Dashboard /> : <AuthForm onAuthSuccess={() => setUser(true)} />;
};

export default App;
