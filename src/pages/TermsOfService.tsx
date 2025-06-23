import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Dumbo AI ('the Service'), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Description of Service",
      content: "Dumbo AI is an AI-powered stock analysis and portfolio simulation platform that provides educational content, market insights, and investment recommendations. The Service is designed for educational and informational purposes only and does not constitute professional financial advice."
    },
    {
      title: "3. Investment Disclaimer",
      content: "All investment information, analysis, and recommendations provided through Dumbo AI are for educational purposes only. Past performance does not guarantee future results. All investments carry risk of loss, and you should consult with qualified financial advisors before making any investment decisions. Dumbo AI and its operators are not responsible for any financial losses incurred based on information provided through the Service."
    },
    {
      title: "4. User Accounts and Responsibilities",
      content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. You must provide accurate and complete information when creating your account."
    },
    {
      title: "5. Prohibited Uses",
      content: "You may not use the Service for any illegal or unauthorized purpose. You agree not to: (a) violate any laws or regulations, (b) transmit any harmful or malicious code, (c) attempt to gain unauthorized access to our systems, (d) use the Service for commercial purposes without authorization, or (e) interfere with other users' use of the Service."
    },
    {
      title: "6. Intellectual Property Rights",
      content: "The Service and its original content, features, and functionality are and will remain the exclusive property of Dumbo AI and its licensors. The Service is protected by copyright, trademark, and other laws. You may not reproduce, distribute, or create derivative works without our express written permission."
    },
    {
      title: "7. Data Accuracy and Reliability",
      content: "While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy, completeness, or timeliness of any data provided through the Service. Market data may be delayed, and AI-generated analysis should not be considered as definitive investment advice."
    },
    {
      title: "8. Limitation of Liability",
      content: "In no event shall Dumbo AI, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service."
    },
    {
      title: "9. Privacy and Data Protection",
      content: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use the Service. By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy."
    },
    {
      title: "10. Modifications to Terms",
      content: "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms."
    },
    {
      title: "11. Termination",
      content: "We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
      title: "12. Governing Law",
      content: "These Terms shall be interpreted and governed by the laws of the jurisdiction in which Dumbo AI operates, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500">
      {/* Header */}
      <motion.div 
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-xl p-2">
                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Last updated: January 2025</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Important Notice</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                Please read these Terms of Service carefully before using Dumbo AI. These terms constitute a legally binding agreement between you and Dumbo AI. By using our service, you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 mt-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-gray-600 dark:text-gray-400" size={24} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Us</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@dumboai.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              legal@dumboai.com
            </a>{' '}
            or through our support channels within the application.
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            size="lg"
            className="min-w-[200px]"
          >
            <ArrowLeft size={20} />
            Go Back
          </Button>
        </motion.div>
      </div>
    </div>
  );
};