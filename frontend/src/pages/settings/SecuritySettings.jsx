import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import TwoFactorModal from '@/components/settings/TwoFactorModal';
import SessionManager from '@/components/settings/SessionManager';

const SecuritySettings = () => {
  const { user, refreshUser } = useAuth();
  const [is2FaOpen, setIs2FaOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await userService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Failed to change password:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password. Please verify current password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <Card className="p-7 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl space-y-6">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Password & Security Credentials
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Ensure your account uses a strong, unique password to prevent unauthorized access.
          </p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              message.type === 'success'
                ? 'bg-success-muted border-success/30 text-success'
                : 'bg-danger-muted border-danger/30 text-danger'
            }`}
          >
            <span>{message.text}</span>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              label="Current Password"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              icon={<Lock className="w-4 h-4" />}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-[38px] text-text-faint hover:text-text cursor-pointer"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              label="New Password"
              placeholder="At least 6 characters"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              icon={<KeyRound className="w-4 h-4" />}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-[38px] text-text-faint hover:text-text cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-1.5 space-y-1">
                <div className="flex gap-1 h-1">
                  <div className={`flex-1 rounded-full transition-colors ${formData.newPassword.length > 0 ? (formData.newPassword.length >= 6 ? 'bg-amber-500' : 'bg-danger') : 'bg-border'}`} />
                  <div className={`flex-1 rounded-full transition-colors ${formData.newPassword.length >= 8 && /[A-Z]/.test(formData.newPassword) ? 'bg-primary' : 'bg-border'}`} />
                  <div className={`flex-1 rounded-full transition-colors ${formData.newPassword.length >= 10 && /[0-9!@#$%^&*]/.test(formData.newPassword) ? 'bg-success' : 'bg-border'}`} />
                </div>
                <p className="text-[10px] text-text-faint text-right font-mono">
                  {formData.newPassword.length < 6 ? 'Weak' : formData.newPassword.length < 8 ? 'Fair' : /[0-9!@#$%^&*]/.test(formData.newPassword) ? 'Strong' : 'Good'}
                </p>
              </div>
            )}
          </div>

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            icon={<KeyRound className="w-4 h-4" />}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              className="gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Two-Factor Authentication (2FA) Card */}
      <Card className="p-7 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-text">Two-Factor Authentication (2FA)</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              user?.twoFactorEnabled
                ? 'bg-success/15 border-success/30 text-success'
                : 'bg-warning/15 border-warning/30 text-warning'
            }`}>
              {user?.twoFactorEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Secure your account with an extra layer of protection. When enabled, signing in requires a 6-digit TOTP code from Google Authenticator or 1Password.
          </p>
        </div>

        <Button
          variant={user?.twoFactorEnabled ? 'danger' : 'primary'}
          size="md"
          onClick={() => setIs2FaOpen(true)}
          className="flex-shrink-0"
        >
          {user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </Button>
      </Card>

      {/* Active Session Management */}
      <Card className="p-7 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl">
        <SessionManager />
      </Card>

      <TwoFactorModal
        isOpen={is2FaOpen}
        onClose={() => setIs2FaOpen(false)}
        enabled={!!user?.twoFactorEnabled}
        onCompleted={refreshUser}
      />
    </div>
  );
};

export default SecuritySettings;
