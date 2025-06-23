import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Eye,
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This includes your name, email address, profile information, and any other information you choose to provide. We also automatically collect certain information about your device and usage of our service, including IP address, browser type, operating system, and usage patterns."
    },
    {
      icon: Database,
      title: "2. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, including to personalize your experience, provide AI-powered stock recommendations, maintain your portfolio simulations, communicate with you about our services, and ensure the security and integrity of our platform. We may also use your information for research and analytics to improve our AI algorithms and service quality."
    },
    {
      icon: UserCheck,
      title: "3. Information Sharing and Disclosure",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with service providers who assist us in operating our platform, conducting our business, or serving our users. We may also disclose your information if required by law or to protect our rights, property, or safety."
    },
    {
      icon: Lock,
      title: "4. Data Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security assessments, access controls, and secure data storage practices. However, no method of transmission over the internet or electronic storage is 100% secure."
    },
    {
      icon: Shield,
      title: "5. Data Retention",
      content: "We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information, though some information may be retained for legitimate business purposes or legal requirements."
    }
  ];

  const additionalSections = [
    {
      title: "6. Your Rights and Choices",
      content: "You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us directly. You may also opt out of certain communications from us. If you are located in the European Union, you have additional rights under GDPR, including the right to data portability and the right to object to processing."
    },
    {
      title: "7. Cookies and Tracking Technologies",
      content: "We use cookies and similar tracking technologies to collect information about your browsing activities and to provide personalized experiences. You can control cookies through your browser settings, though disabling cookies may affect the functionality of our service."
    },
    {
      title: "8. Third-Party Services",
      content: "Our service may contain links to third-party websites or integrate with third-party services (such as Google for authentication). We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any information."
    },
    {
      title: "9. Children's Privacy",
      content: "Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information."
    },
    {
      title: "10. International Data Transfers",
      content: "Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information."
    },
    {
      title: "11. Changes to This Privacy Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date. Your continued use of our service after any changes constitutes your acceptance of the new Privacy Policy."
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
              <div className="bg-green-100 dark:bg-green-900 rounded-xl p-2">
                <Shield className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Last updated: January 2025</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Our Commitment to Your Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            At Dumbo AI, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
            AI-powered stock analysis platform. We believe in transparency and want you to understand exactly how your 
            data is handled.
          </p>
        </motion.div>

        {/* Main Sections with Icons */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-xl p-3 flex-shrink-0">
                  <section.icon className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Sections */}
        <div className="space-y-6">
          {additionalSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (sections.length + index) * 0.1 }}
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
          transition={{ delay: 1.7 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 mt-8 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-blue-600 dark:text-blue-400" size={24} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Our Privacy Team</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy, your personal information, or would like to exercise 
            your privacy rights, please don't hesitate to contact us:
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@dumboai.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                privacy@dumboai.com
              </a>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Data Protection Officer:</strong>{' '}
              <a href="mailto:dpo@dumboai.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                dpo@dumboai.com
              </a>
            </p>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
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