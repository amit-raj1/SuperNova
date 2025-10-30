
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { useAuth } from '../context/AuthContext';

const Main = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
  }, [user, navigate]);
  
  useEffect(() => {
    // Check if page was refreshed
    const wasRefreshed = sessionStorage.getItem('pageRefreshed') === 'true';
    
    if (wasRefreshed) {
      // Clear the flag
      sessionStorage.removeItem('pageRefreshed');
      // Redirect to loading page
      navigate('/', { replace: true });
    } else {
      setIsReady(true);
    }
  }, [navigate]);
  
  if (!isReady) {
    return null; // Don't render anything while checking
  }
  
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <Hero />
    </div>
  );
};

export default Main;

