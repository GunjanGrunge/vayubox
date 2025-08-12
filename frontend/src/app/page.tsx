'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9929EA] via-[#CC66DA] to-[#FAEB92] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold bg-gradient-to-br from-[#9929EA] to-[#CC66DA] bg-clip-text text-transparent">
              D
            </span>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"
          />
          <p className="text-white mt-4 font-medium">Loading Vayubox...</p>
        </motion.div>
      </div>
    );
  }

  if (user?.isAuthenticated) {
    return <DashboardLayout />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9929EA] via-[#CC66DA] to-[#FAEB92] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center lg:justify-between">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block text-white max-w-lg"
        >
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Store, Share &
            <br />
            <span className="text-[#FAEB92]">Organize</span>
            <br />
            Your Files
          </h1>
          <p className="text-xl mb-8 text-white/90 leading-relaxed">
            Vayubox provides secure cloud storage with powerful organization
            tools. Upload, manage, and share your files with ease.
          </p>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FAEB92]">10GB</div>
              <div className="text-sm text-white/80">Free Storage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FAEB92]">🔒</div>
              <div className="text-sm text-white/80">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FAEB92]">⚡</div>
              <div className="text-sm text-white/80">Fast Upload</div>
            </div>
          </div>
        </motion.div>

        {/* Auth Forms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:w-auto"
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
}
