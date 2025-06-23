import { useState, useEffect } from 'react';
import { User } from '../types';
import { FirebaseService } from '../services/firebase';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    console.log('🚀 Setting up auth listener...');
    
    const unsubscribe = firebaseService.onAuthStateChange((authUser) => {
      console.log('🔄 Auth state changed:', {
        email: authUser?.email || 'null',
        country: authUser?.country || 'none',
        onboarding: authUser?.hasCompletedOnboarding || false
      });
      
      setUser(authUser);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async () => {
    try {
      console.log('🔐 Starting sign in...');
      setLoading(true);
      
      const userData = await firebaseService.signInWithGoogle();
      console.log('✅ Sign in successful:', userData.email);
      
      // Force immediate state update and trigger re-render
      setUser(userData);
      setLoading(false);
      toast.success(`Welcome, ${userData.displayName?.split(' ')[0]}!`);
      
      // Force a small delay to ensure state is updated
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('❌ Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseService.signOut();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCountry = async (country: string) => {
    if (!user) return;

    try {
      console.log('🌍 Updating country to:', country);
      
      await firebaseService.updateUserCountry(user.uid, country);
      
      // Force immediate state update
      const updatedUser = { ...user, country };
      setUser(updatedUser);
      toast.success('Country updated successfully');
      
      // Force navigation after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('❌ Country update error:', error);
      toast.error('Failed to update country');
      throw error;
    }
  };

  const markOnboardingComplete = async () => {
    if (!user) return;

    try {
      console.log('✅ Completing onboarding...');
      
      await firebaseService.markOnboardingComplete(user.uid);
      
      // Force immediate state update
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      setUser(updatedUser);
      toast.success('Welcome to Dumbo AI!');
      
      // Force navigation after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('❌ Onboarding error:', error);
      toast.error('Failed to complete onboarding');
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    updateCountry,
    markOnboardingComplete
  };
};