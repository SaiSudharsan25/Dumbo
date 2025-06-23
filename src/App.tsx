import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { BottomNavigation } from './components/BottomNavigation';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CountrySelection } from './pages/CountrySelection';
import { Login } from './pages/Login';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { StockDetailsPage } from './pages/StockDetails';
import { Portfolio } from './pages/Portfolio';
import { Settings } from './pages/Settings';
import { Watchlist } from './pages/Watchlist';
import { MarketNews } from './pages/MarketNews';
import { StockScreener } from './pages/StockScreener';
import { TradingSimulator } from './pages/TradingSimulator';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  console.log('🎯 App State:', { 
    userEmail: user?.email || 'null', 
    loading, 
    hasCountry: !!user?.country,
    hasOnboarding: !!user?.hasCompletedOnboarding
  });

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" color="light" />
            <p className="text-gray-400 mt-4">Loading Dumbo AI...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          
          {/* Authentication flow */}
          {!user ? (
            // Not authenticated - show login
            <Route path="*" element={<Login />} />
          ) : !user.country ? (
            // Authenticated but no country - show country selection
            <Route path="*" element={<CountrySelection />} />
          ) : !user.hasCompletedOnboarding ? (
            // Has country but no onboarding - show onboarding
            <Route path="*" element={<Onboarding />} />
          ) : (
            // Fully authenticated - show main app
            <>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/stock/:symbol" element={<StockDetailsPage />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/news" element={<MarketNews />} />
              <Route path="/screener" element={<StockScreener />} />
              <Route path="/simulator" element={<TradingSimulator />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </>
          )}
        </Routes>
        
        {/* Show bottom navigation only when fully authenticated */}
        {user && user.country && user.hasCompletedOnboarding && <BottomNavigation />}
        
        <Toaster 
          position="top-center"
          toastOptions={{
            className: 'bg-gray-800 text-white border border-gray-700',
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#FFFFFF',
              border: '1px solid #374151'
            }
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;