import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Camera, Trophy, ChevronRight, Check } from 'lucide-react';
import { useDriverStore } from '../store/driverStore';
import { useNotifications } from '../context/NotificationContext';

const steps = [
  {
    id: 'track',
    title: 'Track Your Trips',
    desc: 'Get real-time navigation and updates for every delivery.',
    icon: <MapPin className="w-12 h-12 text-blue-600" />,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    id: 'report',
    title: 'Report Issues',
    desc: 'Instantly report breakdowns, accidents, or delays.',
    icon: <Truck className="w-12 h-12 text-red-600" />,
    color: 'bg-red-50 text-red-600'
  },
  {
    id: 'pod',
    title: 'Upload PODs',
    desc: 'Capture photos and signatures for faster payments.',
    icon: <Camera className="w-12 h-12 text-green-600" />,
    color: 'bg-green-50 text-green-600'
  },
  {
    id: 'rewards',
    title: 'Earn Rewards',
    desc: 'Climb the leaderboard and win bonuses every month.',
    icon: <Trophy className="w-12 h-12 text-amber-500" />,
    color: 'bg-amber-50 text-amber-600'
  }
];

export const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { setOnboarded, setLanguage } = useDriverStore();
  const { requestPermissions } = useNotifications();
  const { i18n } = useTranslation();
  
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const handleNext = async () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      // Request permissions on last step
      await requestPermissions();
      setOnboarded();
      navigate('/login');
    }
  };

  const changeLanguage = (l: 'en' | 'hi') => {
    setLang(l);
    setLanguage(l);
    i18n.changeLanguage(l);
  };

  // Language Selection Screen (Step 0)
  if (step === 0) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col justify-between">
        <div className="mt-12">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome to Optimile</h1>
          <p className="text-gray-500 text-lg">Select your preferred language to continue.</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
              lang === 'en' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🇺🇸</span>
              <div className="text-left">
                <p className={`font-bold text-lg ${lang === 'en' ? 'text-blue-900' : 'text-gray-900'}`}>English</p>
                <p className="text-xs text-gray-500">Default</p>
              </div>
            </div>
            {lang === 'en' && <Check className="w-6 h-6 text-blue-600" />}
          </button>

          <button
            onClick={() => changeLanguage('hi')}
            className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
              lang === 'hi' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🇮🇳</span>
              <div className="text-left">
                <p className={`font-bold text-lg ${lang === 'hi' ? 'text-blue-900' : 'text-gray-900'}`}>हिंदी</p>
                <p className="text-xs text-gray-500">Hindi</p>
              </div>
            </div>
            {lang === 'hi' && <Check className="w-6 h-6 text-blue-600" />}
          </button>
        </div>

        <button
          onClick={() => setStep(1)}
          className="w-full h-14 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          CONTINUE <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Feature Cards (Steps 1-4)
  const currentFeature = steps[step - 1];
  const isLastStep = step === steps.length;

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
        <motion.div 
          className="h-full bg-blue-600" 
          initial={{ width: '0%' }}
          animate={{ width: `${(step / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xs"
          >
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 ${currentFeature.color} bg-opacity-20`}>
              {currentFeature.icon}
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">{currentFeature.title}</h2>
            <p className="text-gray-500 text-lg leading-relaxed">{currentFeature.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-colors ${
                idx + 1 === step ? 'bg-blue-600 w-6' : 'bg-gray-200'
              }`} 
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full h-14 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {isLastStep ? 'GET STARTED' : 'NEXT'} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
