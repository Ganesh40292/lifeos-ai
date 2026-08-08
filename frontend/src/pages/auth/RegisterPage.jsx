import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import SoftAurora from '@/components/ui/SoftAurora';
import BorderBeamPanel from '@/components/ui/BorderBeamPanel';
import { APP_NAME } from '@/utils/constants';

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    try {
      await register(formData.fullName, formData.email, formData.password);
      localStorage.setItem('aetheria_show_onboarding', 'true');
    } catch (err) {
      let message = 'Registration failed. Please try again.';
      if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
        const firstErr = Object.values(err.response.data.errors)[0];
        if (firstErr) message = firstErr;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
        message = 'Backend server is starting up. Please wait 5 seconds and try again.';
      }
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex relative overflow-hidden">
      {/* Soft Aurora WebGL Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <SoftAurora
          speed={0.5}
          scale={1.4}
          brightness={0.85}
          color1="#2563eb"
          color2="#7c3aed"
          noiseFrequency={2.2}
          noiseAmplitude={1.0}
          bandHeight={0.5}
          bandSpread={1.0}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={0.8}
          enableMouseInteraction={true}
          mouseInfluence={0.2}
        />
      </div>

      {/* Centered Form Card with Border Beam */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <BorderBeamPanel
            beams={1}
            thickness={1}
            radius={20}
            idleSpeed={28}
            hoverSpeed={120}
            glow={true}
            colors={['#6366f1', '#a855f7']}
            className="w-full space-y-6 rounded-[20px] border border-border hover:border-primary/40 bg-bg-card/85 backdrop-blur-xl shadow-2xl hover:shadow-primary/10 hover:shadow-3xl transition-[border-color,box-shadow] duration-300 cursor-default"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-text">{APP_NAME}</span>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Register</span>
            </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <h2 className="text-xl font-bold text-text">Get Started</h2>
              <p className="text-xs text-text-muted mt-1">Set up your workspace in seconds</p>
            </div>

            {apiError && (
              <div className="p-3 rounded-lg bg-danger-muted border border-danger/30 text-xs text-danger">
                {apiError}
              </div>
            )}

            <Input
              id="fullName"
              name="fullName"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon={<User className="w-4 h-4" />}
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
            />

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<Lock className="w-4 h-4" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-faint hover:text-text cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1 h-1">
                    <div className={`flex-1 rounded-full transition-colors ${formData.password.length > 0 ? (formData.password.length >= 6 ? 'bg-amber-500' : 'bg-danger') : 'bg-border'}`} />
                    <div className={`flex-1 rounded-full transition-colors ${formData.password.length >= 8 && /[A-Z]/.test(formData.password) ? 'bg-primary' : 'bg-border'}`} />
                    <div className={`flex-1 rounded-full transition-colors ${formData.password.length >= 10 && /[0-9!@#$%^&*]/.test(formData.password) ? 'bg-success' : 'bg-border'}`} />
                  </div>
                  <p className="text-[10px] text-text-faint text-right font-mono">
                    {formData.password.length < 6 ? 'Weak' : formData.password.length < 8 ? 'Fair' : /[0-9!@#$%^&*]/.test(formData.password) ? 'Strong' : 'Good'}
                  </p>
                </div>
              )}
            </div>

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="gap-2 pt-2">
              <span>Create Account</span> <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-border/80 w-full" />
              <span className="bg-[#0b101c] px-3 text-[10px] uppercase font-bold text-text-faint whitespace-nowrap tracking-wider">
                Or Continue With
              </span>
              <div className="border-t border-border/80 w-full" />
            </div>

            {/* Sign in with Google Button */}
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '870947341702-0n311b7s6rr9pvbrreqof10ftik0f7pb.apps.googleusercontent.com';
                const redirectUri = encodeURIComponent(window.location.origin.replace(/\/+$/, ''));
                const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=openid%20email%20profile`;
                window.location.href = googleAuthUrl;
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-border bg-bg-elevated/60 hover:bg-bg-elevated text-text text-xs font-bold transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:border-primary/40 hover:shadow-md"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
          </BorderBeamPanel>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
