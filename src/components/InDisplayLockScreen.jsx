import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, 
  Unlock, 
  Fingerprint, 
  Delete, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';
import sounds from '../utils/soundEffects';
import { isBiometricsAvailable, verifyDeviceBiometric } from '../utils/webAuthn';

const InDisplayLockScreen = ({ onUnlock, onLogout }) => {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if biometric/device lock is supported and enabled
  useEffect(() => {
    let isMounted = true;
    const checkSupport = async () => {
      const available = await isBiometricsAvailable();
      if (isMounted) {
        setHasBiometrics(available);
        const bioEnabled = localStorage.getItem('cashflow_biometric_enabled') === 'true';
        // Auto-prompt biometric if user previously enabled it
        if (available && bioEnabled) {
          handleBiometricUnlock();
        }
      }
    };
    checkSupport();
    return () => { isMounted = false; };
  }, []);

  const handleBiometricUnlock = async () => {
    setBiometricLoading(true);
    setErrorMessage('');
    try {
      const verified = await verifyDeviceBiometric();
      if (verified) {
        sounds.playCashIn();
        setIsSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 350);
      } else {
        setErrorMessage('বায়োমেট্রিক বা স্ক্রিন লক যাচাই সম্পন্ন হয়নি। পিন কোড ব্যবহার করুন।');
      }
    } catch (err) {
      setErrorMessage(err.message || 'ডিভাইস ভেরিফিকেশন ব্যর্থ হয়েছে।');
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleKeyPress = useCallback((digit) => {
    if (pin.length >= 4 || isSuccess) return;
    sounds.playClick();
    setIsError(false);
    setErrorMessage('');
    const newPin = pin + digit;
    setPin(newPin);

    // Auto verify when 4th digit entered
    if (newPin.length === 4) {
      const savedPin = localStorage.getItem('cashflow_pin');
      if (newPin === savedPin) {
        sounds.playCashIn();
        setIsSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 350);
      } else {
        sounds.playWarning();
        setIsError(true);
        setErrorMessage('ভুল পিন কোড! অনুগ্রহ করে আবার চেষ্টা করুন।');
        setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 700);
      }
    }
  }, [pin, isSuccess, onUnlock]);

  const handleDelete = useCallback(() => {
    sounds.playClick();
    setIsError(false);
    setPin(prev => prev.slice(0, -1));
  }, []);

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060911]/90 backdrop-blur-2xl animate-fadeIn select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center relative z-10">
        {/* App Logo & Lock Badge */}
        <div className="flex flex-col items-center mb-6">
          <div className={`w-18 h-18 rounded-3xl flex items-center justify-center mb-3 transition-all duration-300 shadow-2xl ${
            isSuccess 
              ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/50' 
              : isError 
              ? 'bg-rose-500 text-white animate-shake shadow-rose-500/50'
              : 'bg-gradient-to-tr from-[#15233c] to-[#1e3256] text-emerald-400 border border-white/10 shadow-emerald-500/10'
          }`}>
            {isSuccess ? (
              <Unlock className="w-8 h-8 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-xl font-heading font-black text-white tracking-tight flex items-center gap-1.5">
            <span>CashFlow</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              PRO
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ইন-ডিসপ্লে পিন কোড বা বায়োমেট্রিক দিয়ে আনলক করুন
          </p>
        </div>

        {/* 4-Dot PIN Indicator Display */}
        <div className={`flex items-center gap-4 mb-4 transition-transform ${isError ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isSuccess
                    ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-110'
                    : isError
                    ? 'bg-rose-500 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]'
                    : isFilled
                    ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] scale-110'
                    : 'bg-white/[0.04] border-white/20'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-3 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* In-Display 3D Touch Keypad */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-3.5 my-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit.toString())}
              disabled={isSuccess}
              className="h-16 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-white/[0.18] border border-white/[0.08] hover:border-white/[0.18] text-white font-mono font-bold text-2xl transition-all duration-150 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer select-none"
            >
              {digit}
            </button>
          ))}

          {/* Bottom Row: Biometric/Screen Lock, 0, Backspace */}
          <button
            type="button"
            onClick={handleBiometricUnlock}
            disabled={biometricLoading || isSuccess}
            className="h-16 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/35 border border-emerald-500/30 text-emerald-400 transition-all duration-150 active:scale-95 shadow-md flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40"
            title="বায়োমেট্রিক বা ডিভাইসের স্ক্রিন লক দিয়ে আনলক করুন"
          >
            <Fingerprint className={`w-6 h-6 ${biometricLoading ? 'animate-pulse' : ''}`} />
            <span className="text-[9px] font-bold tracking-tight">লক ভেরিফাই</span>
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={isSuccess}
            className="h-16 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-white/[0.18] border border-white/[0.08] hover:border-white/[0.18] text-white font-mono font-bold text-2xl transition-all duration-150 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={pin.length === 0 || isSuccess}
            className="h-16 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.15] border border-white/[0.06] text-slate-400 hover:text-white transition-all duration-150 active:scale-95 shadow-md flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="মুছুন"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Device Screen Lock alternative text button */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleBiometricUnlock}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 py-1 px-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>মোবাইলের নিজস্ব স্ক্রিন লক দিয়ে খুলুন</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('আপনি কি অ্যাকাউন্ট থেকে লগআউট করতে চান?')) {
                  onLogout();
                }
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors cursor-pointer mt-1"
            >
              পিন ভুলে গেছেন? লগআউট করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InDisplayLockScreen;

