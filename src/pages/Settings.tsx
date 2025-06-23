import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Globe, 
  Trash2, 
  LogOut, 
  Shield, 
  ArrowLeft,
  Camera,
  Link,
  BookOpen,
  ExternalLink,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BoltBadge } from '../components/BoltBadge';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { useBrokerage } from '../hooks/useBrokerage';
import { COUNTRIES } from '../config/countries';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, updateCountry } = useAuth();
  const { clearPortfolio } = usePortfolio();
  const { accounts, disconnectAccount } = useBrokerage();
  const [loading, setLoading] = useState(false);
  const [countryLoading, setCountryLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === user?.country);

  const handleSignOut = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;
    
    setLoading(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPortfolio = async () => {
    if (!window.confirm('Are you sure you want to reset your portfolio? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await clearPortfolio();
      toast.success('Portfolio reset successfully');
    } catch (error) {
      toast.error('Failed to reset portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = async (countryCode: string) => {
    setCountryLoading(true);
    try {
      await updateCountry(countryCode);
      setShowCountryModal(false);
      toast.success('Country updated successfully');
    } catch (error) {
      toast.error('Failed to update country');
    } finally {
      setCountryLoading(false);
    }
  };

  const handleDisconnectBrokerageAccount = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to disconnect this brokerage account?')) return;
    
    try {
      await disconnectAccount(accountId);
      toast.success('Brokerage account disconnected');
    } catch (error) {
      toast.error('Failed to disconnect brokerage account');
    }
  };

  const TutorialModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={() => setShowTutorialModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">How to Get API Keys</h2>
            <button
              onClick={() => setShowTutorialModal(false)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-900/30 border border-blue-600/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Setup Guide</h3>
              <ol className="text-blue-200 space-y-2">
                <li>1. Create an account with your chosen brokerage provider</li>
                <li>2. Navigate to API settings or developer tools in your account</li>
                <li>3. Generate API Key and Secret Key</li>
                <li>4. Copy the credentials and paste them here</li>
                <li>5. Click "Connect Account" to link your portfolio</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-4">🇺🇸 US Brokers</h4>
                <div className="space-y-3">
                  <a href="https://alpaca.markets" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
                    <span className="text-green-400">Alpaca Markets</span>
                    <ExternalLink size={16} className="text-gray-400" />
                  </a>
                  <a href="https://www.tdameritrade.com" target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
                    <span className="text-green-400">TD Ameritrade</span>
                    <ExternalLink size={16} className="text-gray-400" />
                  </a>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-4">🇮🇳 Indian Brokers</h4>
                <div className="space-y-3">
                  <a href="https://zerodha.com" target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
                    <span className="text-green-400">Zerodha Kite</span>
                    <ExternalLink size={16} className="text-gray-400" />
                  </a>
                  <a href="https://upstox.com" target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
                    <span className="text-green-400">Upstox</span>
                    <ExternalLink size={16} className="text-gray-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const PrivacyPolicyModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={() => setShowPrivacyPolicy(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="p-2 hover:bg-gray-800 rounded-full"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          
          <div className="prose prose-sm max-w-none text-gray-300 leading-relaxed space-y-4">
            <p>
              This application uses AI to provide insights based on publicly available stock data. 
              Stock investments are inherently risky and unpredictable.
            </p>
            
            <p>
              The insights generated by the Dumbo AI are meant for educational and simulation purposes only 
              and should not be treated as professional financial advice.
            </p>
            
            <p>
              The developers do not take responsibility for any financial loss or investment decisions 
              made by the users. Always consult certified financial advisors before making real investments.
            </p>
            
            <h3 className="font-semibold text-white mt-6">Data Collection</h3>
            <p>
              We collect minimal personal information necessary for app functionality, including your 
              email address, name, and selected country for localized content.
            </p>
            
            <h3 className="font-semibold text-white mt-6">Data Usage</h3>
            <p>
              Your data is used solely to provide personalized stock recommendations and portfolio tracking. 
              We do not sell or share your personal information with third parties.
            </p>
            
            <h3 className="font-semibold text-white mt-6">Security</h3>
            <p>
              We implement industry-standard security measures to protect your data. All communications 
              are encrypted and your portfolio data is securely stored.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const CountryModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={() => setShowCountryModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Select Country</h2>
            <button
              onClick={() => setShowCountryModal(false)}
              className="p-2 hover:bg-gray-800 rounded-full"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountryChange(country.code)}
                disabled={countryLoading}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  user?.country === country.code
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{country.flag}</span>
                    <div>
                      <p className="font-medium text-white">{country.name}</p>
                      <p className="text-sm text-gray-400">{country.currency}</p>
                    </div>
                  </div>
                  {countryLoading && user?.country === country.code && (
                    <LoadingSpinner size="sm" color="light" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Bolt.new Badge - Bottom Center on Settings Page */}
      <BoltBadge variant="text" position="bottom-center" />

      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                  <User size={40} className="text-gray-400" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2">
                <Camera size={16} className="text-black" />
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.displayName}</h2>
              <p className="text-gray-400 text-lg">{user?.email}</p>
              <p className="text-sm text-gray-500">
                Member since {user?.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Preferences</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowCountryModal(true)}
                className="w-full flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="text-gray-400" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-white">Country</p>
                    <p className="text-sm text-gray-400">
                      {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : 'Not selected'}
                    </p>
                  </div>
                </div>
                <ArrowLeft className="text-gray-400 rotate-180" size={16} />
              </button>
            </div>
          </motion.div>

          {/* Connected Accounts */}
          {accounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Connected Accounts</h3>
              
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Link className="text-green-400" size={20} />
                      <div>
                        <p className="font-medium text-white">{account.provider}</p>
                        <p className="text-sm text-gray-400">Account: {account.accountNumber}</p>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDisconnectBrokerageAccount(account.id)}
                      className="bg-red-600/20 hover:bg-red-600/30 border-red-600/30 text-red-400"
                    >
                      Disconnect
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Help & Support</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowTutorialModal(true)}
                className="w-full flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="text-gray-400" size={20} />
                  <span className="font-medium text-white">Brokerage Connection Tutorial</span>
                </div>
                <ExternalLink className="text-gray-400" size={16} />
              </button>
              
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="w-full flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="text-gray-400" size={20} />
                  <span className="font-medium text-white">Privacy Policy</span>
                </div>
                <ArrowLeft className="text-gray-400 rotate-180" size={16} />
              </button>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Actions</h3>
            
            <div className="space-y-3">
              <Button
                variant="danger"
                onClick={handleResetPortfolio}
                loading={loading}
                className="w-full justify-between bg-red-600/20 hover:bg-red-600/30 border-red-600/30 text-red-400"
              >
                <span className="flex items-center gap-3">
                  <Trash2 size={20} />
                  Reset Portfolio
                </span>
              </Button>
            </div>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="secondary"
              onClick={handleSignOut}
              loading={loading}
              className="w-full justify-center bg-white/10 hover:bg-white/20 border-white/20 text-white"
              size="lg"
            >
              <LogOut size={20} />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {showCountryModal && <CountryModal />}
      {showPrivacyPolicy && <PrivacyPolicyModal />}
      {showTutorialModal && <TutorialModal />}

      {/* Bottom Navigation Spacer */}
      <div className="h-24" />
    </div>
  );
};