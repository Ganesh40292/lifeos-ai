import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, WifiOff, X, Sparkles, Check } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

const PwaBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Status Alert */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-danger text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>You are currently offline. {APP_NAME} is operating in local cached state mode.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA App Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 z-[70] max-w-sm p-4 rounded-2xl bg-bg-card/90 border border-primary/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary/30">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-bold text-text flex items-center gap-1">
                  Install {APP_NAME} <Sparkles className="w-3 h-3 text-primary" />
                </h4>
                <p className="text-[10px] text-text-muted">Add to Desktop/Mobile home screen for 1-click launch.</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-light transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-primary/20"
              >
                <Download className="w-3.5 h-3.5" /> Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PwaBanner;
