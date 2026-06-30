import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import router from '@/routes/AppRoutes';
import Loader3D from '@/components/ui/Loader3D';

const App = () => {
  const [showLoader, setShowLoader] = useState(true);
  const [isBooted, setIsBooted] = useState(false);

  // Set booted state on window load to ensure all critical assets are ready
  useEffect(() => {
    const handleLoad = () => {
      // Allow the animation sequence to proceed
    };
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  const handleBootComplete = () => {
    setIsBooted(true);
    // Keep loader mounted until the ripple reveal transition is complete
    setTimeout(() => {
      setShowLoader(false);
    }, 1200);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Loader3D show={showLoader} onBootComplete={handleBootComplete} />
        
        {/* Cinematic Clip Path Reveal Wrapper */}
        <motion.div
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={isBooted ? { clipPath: 'circle(150% at 50% 50%)' } : {}}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="w-full min-h-screen bg-[#09090B]"
        >
          <RouterProvider router={router} />
        </motion.div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
