import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Shield, Eye, EyeOff, CheckCircle, AlertCircle, X, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { BrokerageApiService, BrokerageAccount } from '../services/brokerageApi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface BrokerageConnectionProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (account: BrokerageAccount) => void;
}

export const BrokerageConnection: React.FC<BrokerageConnectionProps> = ({
  isOpen,
  onClose,
  onAccountConnected
}) => {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [credentials, setCredentials] = useState({
    apiKey: '',
    secretKey: '',
    accountId: ''
  });
  const [showSecrets, setShowSecrets] = useState({
    apiKey: false,
    secretKey: false
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'credentials' | 'connecting'>('select');
  const [showTutorial, setShowTutorial] = useState(false);

  const brokerageApi = BrokerageApiService.getInstance();
  const providers = brokerageApi.getBrokerageProviders(user?.country || 'US');

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setStep('credentials');
  };

  const handleConnect = async () => {
    if (!credentials.apiKey || !credentials.secretKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setStep('connecting');

    try {
      const isValid = await brokerageApi.validateCredentials(selectedProvider, credentials);
      
      if (!isValid) {
        toast.error('Invalid credentials. Please check your API keys.');
        setStep('credentials');
        return;
      }

      const account = await brokerageApi.connectBrokerageAccount(selectedProvider, credentials);
      
      onAccountConnected(account);
      toast.success(`Successfully connected to ${account.provider}!`);
      onClose();
      
      setStep('select');
      setSelectedProvider('');
      setCredentials({ apiKey: '', secretKey: '', accountId: '' });
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Failed to connect to brokerage account');
      setStep('credentials');
    } finally {
      setLoading(false);
    }
  };

  const selectedProviderInfo = providers.find(p => p.id === selectedProvider);

  const TutorialModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]"
      onClick={() => setShowTutorial(false)}
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
              onClick={() => setShowTutorial(false)}
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-green-600/20 border border-green-600/30 rounded-xl p-3"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Link className="text-green-400" size={24} />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Connect Brokerage Account</h2>
                <p className="text-gray-400 text-sm">Link your real trading account for live portfolio tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowTutorial(true)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <BookOpen size={20} className="text-gray-400" />
              </motion.button>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'select' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Available Brokers in {user?.country || 'US'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Choose your brokerage provider to connect your real trading account
                  </p>
                </div>

                {/* Tutorial Link */}
                <div className="bg-blue-900/30 border border-blue-600/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-blue-400" size={20} />
                      <div>
                        <p className="font-medium text-white">Need help getting started?</p>
                        <p className="text-blue-300 text-sm">Learn how to create and connect your brokerage account</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTutorial(true)}
                      className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-600/30 text-blue-400"
                    >
                      View Tutorial
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {providers.map((provider, index) => (
                    <motion.button
                      key={provider.id}
                      onClick={() => handleProviderSelect(provider.id)}
                      className="p-4 border border-gray-700 rounded-xl hover:border-green-500 hover:bg-green-500/10 transition-all duration-200 text-left"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{provider.logo}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{provider.name}</h4>
                          <p className="text-gray-400 text-sm">{provider.description}</p>
                          <div className="flex gap-2 mt-2">
                            {provider.features?.map((feature: string) => (
                              <span
                                key={feature}
                                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-green-400">
                          <CheckCircle size={20} />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'credentials' && selectedProviderInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-2xl">{selectedProviderInfo.logo}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Connect to {selectedProviderInfo.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Enter your API credentials to connect your account
                    </p>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-green-900/30 border border-green-600/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-green-100 text-sm">Secure Connection</h4>
                      <p className="text-green-200 text-sm mt-1">
                        Your credentials are encrypted and never stored on our servers. We only use read-only access to fetch your portfolio data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Credentials Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      API Key *
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.apiKey ? 'text' : 'password'}
                        value={credentials.apiKey}
                        onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white pr-12"
                        placeholder="Enter your API key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets({ ...showSecrets, apiKey: !showSecrets.apiKey })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showSecrets.apiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Secret Key *
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.secretKey ? 'text' : 'password'}
                        value={credentials.secretKey}
                        onChange={(e) => setCredentials({ ...credentials, secretKey: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white pr-12"
                        placeholder="Enter your secret key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets({ ...showSecrets, secretKey: !showSecrets.secretKey })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showSecrets.secretKey ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={credentials.accountId}
                      onChange={(e) => setCredentials({ ...credentials, accountId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      placeholder="Enter account ID if required"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setStep('select')}
                    className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConnect}
                    loading={loading}
                    disabled={!credentials.apiKey || !credentials.secretKey}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold"
                  >
                    <Link size={20} />
                    Connect Account
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'connecting' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <LoadingSpinner size="lg" color="light" />
                <h3 className="text-lg font-semibold text-white mt-4">
                  Connecting to {selectedProviderInfo?.name}
                </h3>
                <p className="text-gray-400 mt-2">
                  Validating credentials and establishing secure connection...
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Tutorial Modal */}
      {showTutorial && <TutorialModal />}
    </AnimatePresence>
  );
};