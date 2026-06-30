import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import ThreeDBackground from '@/components/ui/ThreeDBackground';

/**
 * Registration page with full name, email, password, and confirm password fields.
 */
const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register(formData.fullName, formData.email, formData.password);
      localStorage.setItem('lifeos_show_onboarding', 'true');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot connect to server. Please ensure the backend is running on port 8080.'
          : 'Registration failed. Please try again.');
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
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
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
            <h1 className="text-4xl font-bold text-text mb-3">Join LifeOS</h1>
            <p className="text-lg text-text-muted max-w-md">
              Start organizing every aspect of your life.
            </p>
            <div className="mt-8 flex flex-col gap-3 text-sm text-text-faint max-w-xs mx-auto text-left">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-success text-xs">✓</span>
                </div>
                Track academics, attendance & grades
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-success text-xs">✓</span>
                </div>
                Manage finances & budgets
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-success text-xs">✓</span>
                </div>
                Monitor health & build habits
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Registration Form */}
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

          <h2 className="text-2xl font-bold text-text mb-1">Create account</h2>
          <p className="text-sm text-text-muted mb-8">
            Set up your LifeOS dashboard in seconds
          </p>

          {apiError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-danger-muted border border-danger/20 text-sm text-danger">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="name"
            />

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
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Create account
            </Button>
          </form>


          <p className="text-sm text-text-muted text-center mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary-light font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
