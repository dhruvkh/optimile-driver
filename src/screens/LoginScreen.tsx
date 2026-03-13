import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../store/driverStore';
import { useFeatureStore } from '../store/featureStore';
import { BigActionButton } from '../components/BigActionButton';
import { Truck, Languages, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, setLanguage, language } = useDriverStore();
  const { fetchFeatures } = useFeatureStore();
  const { t, i18n } = useTranslation();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleSendOtp = async () => {
    if (mobileNumber.length === 10) {
      try {
        await api.auth.sendOtp('+91' + mobileNumber);
        setStep('otp');
        // Simulate SMS OTP read for demo/dev
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            setOtp(['1', '2', '3', '4']);
          }, 1500);
        }
      } catch (error) {
        console.error('Failed to send OTP:', error);
        alert('Failed to send OTP. Please try again.');
      }
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 4) {
      try {
        const response = await api.auth.verifyOtp('+91' + mobileNumber, enteredOtp);
        const { token, driver } = response;
        
        login({
          driverId: driver.id,
          name: driver.name,
          mobileNumber: driver.phone,
          vehicleId: driver.vehicleId,
          authToken: token,
          driverType: driver.type // Assuming API returns type
        });
        
        // Fetch feature config
        await fetchFeatures();
        
        navigate('/home');
      } catch (error) {
        console.error('Failed to verify OTP:', error);
        alert('Invalid OTP. Please try again.');
      }
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col p-6 relative overflow-hidden">
      {/* Language Toggle */}
      <div className="flex justify-end absolute top-6 right-6 z-10">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 active:bg-white/20 transition-colors"
        >
          <Languages className="w-4 h-4" />
          <span className="font-medium">{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </div>

      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center mt-12">
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-900/50 transform rotate-3">
          <Truck className="w-12 h-12 text-blue-700" />
        </div>
        <h1 className="text-4xl font-black text-white text-center tracking-tight">Optimile</h1>
        <p className="text-blue-200 mt-2 font-medium tracking-wide uppercase text-sm">Driver Partner App</p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-sm mx-auto mb-12 space-y-8">
        {step === 'phone' ? (
          <div className="animate-in slide-in-from-bottom-10 fade-in duration-500">
            <label className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-3 block ml-1">
              Enter Mobile Number
            </label>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 flex items-center">
                <span className="text-white font-bold text-xl border-r border-white/20 pr-3">+91</span>
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setMobileNumber(val);
                }}
                className="w-full h-16 pl-20 pr-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white text-2xl font-bold placeholder-blue-300/50 focus:border-white focus:bg-white/20 focus:outline-none transition-all"
                placeholder="00000 00000"
                autoFocus
              />
            </div>
            <p className="text-blue-200 text-xs mt-3 ml-1">
              We will send a 4-digit OTP to verify your number.
            </p>
            
            <div className="mt-8">
              <BigActionButton 
                onClick={handleSendOtp}
                disabled={mobileNumber.length !== 10}
                className={mobileNumber.length !== 10 ? 'opacity-50' : ''}
                icon={<ArrowRight className="w-6 h-6" />}
              >
                Get OTP
              </BigActionButton>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <label className="text-blue-100 text-xs font-bold uppercase tracking-wider block">
                Verify OTP
              </label>
              <button 
                onClick={() => setStep('phone')}
                className="text-blue-200 text-xs font-bold underline"
              >
                Change Number
              </button>
            </div>
            
            <div className="flex justify-between gap-3 mb-8">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 text-white text-3xl font-bold text-center focus:border-white focus:bg-white/20 focus:outline-none transition-all"
                />
              ))}
            </div>

            <BigActionButton 
              onClick={handleVerifyOtp}
              disabled={otp.join('').length !== 4}
              className={otp.join('').length !== 4 ? 'opacity-50' : ''}
            >
              Verify & Login
            </BigActionButton>
            
            <p className="text-center text-blue-200 text-sm mt-6">
              Auto-reading OTP...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
