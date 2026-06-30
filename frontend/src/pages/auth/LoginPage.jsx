import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import ThreeDBackground from '@/components/ui/ThreeDBackground';

/**
 * Login page with email/password form, error handling, and smooth transitions.
 */
const LoginPage = () => {
  const { login, loginWith2Fa, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // 2FA pending state
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const newErrors = {};
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const res = await login(formData.email, formData.password);
      if (res && res.twoFactorRequired) {
        setTwoFactorPending(true);
        setTempToken(res.tempSessionToken);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot connect to server. Please ensure the backend is running on port 8080.'
          : 'Login failed. Please try again.');
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FaSubmit = async (e) => {
    e.preventDefault();
    if (totpCode.length !== 6 || isNaN(totpCode)) {
      setApiError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      await loginWith2Fa(tempToken, parseInt(totpCode));
    } catch (err) {
      const message =
        err.response?.data?.message || 'Invalid code. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-bg flex relative overflow-hidden">
      {/* Live Interactive 3D Mesh Wave Background */}
      <ThreeDBackground />

      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-bg-card/75 backdrop-blur-md border-r border-border relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text mb-3">LifeOS</h1>
            <p className="text-lg text-text-muted max-w-md">
              The Operating System for Your Life.
            </p>
            <p className="text-sm text-text-faint mt-4 max-w-sm mx-auto">
              Manage academics, finances, career, health, and more — all from one dashboard.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text">LifeOS</span>
          </div>

          {twoFactorPending ? (
            <>
              <h2 className="text-2xl font-bold text-text mb-1">Two-Factor Auth</h2>
              <p className="text-sm text-text-muted mb-8">
                Enter the 6-digit code from your authenticator app to complete sign-in.
              </p>

              {apiError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-danger-muted border border-danger/20 text-sm text-danger">
                  {apiError}
                </div>
              )}

              <form onSubmit={handle2FaSubmit} className="space-y-5">
                <Input
                  id="totpCode"
                  name="totpCode"
                  type="text"
                  label="6-Digit Verification Code"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  autoComplete="one-time-code"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  Verify & Sign In
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorPending(false);
                    setTotpCode('');
                    setApiError('');
                  }}
                  className="w-full text-center text-xs text-text-faint hover:text-text cursor-pointer transition-colors mt-1"
                >
                  Back to email login
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-text mb-1">Welcome back</h2>
              <p className="text-sm text-text-muted mb-8">
                Sign in to your account to continue
              </p>

              {apiError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-danger-muted border border-danger/20 text-sm text-danger">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={<Mail className="w-4 h-4" />}
                  autoComplete="email"
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={<Lock className="w-4 h-4" />}
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  Sign in
                </Button>
              </form>


              <p className="text-sm text-text-muted text-center mt-6">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary hover:text-primary-light font-medium transition-colors"
                >
                  Create one
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
