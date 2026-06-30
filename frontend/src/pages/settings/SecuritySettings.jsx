import { useState } from 'react';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import TwoFactorModal from '@/components/settings/TwoFactorModal';
import SessionManager from '@/components/settings/SessionManager';

const SecuritySettings = () => {
  const { user, refreshUser } = useAuth();
  const [is2FaOpen, setIs2FaOpen] = useState(false);
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
    setMessage(null);
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
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password. Please check your current password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Lock className="w-5 h-5 mr-2 text-purple-400" />
          Update Password
        </h2>
        <p className="text-sm text-gray-400 mt-1">Ensure your account is using a long, random password to stay secure.</p>
      </div>

      <div className="p-6">
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/10 text-red-400 border border-red-500/50'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              className="flex items-center px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-spin border-2 border-white/20 border-t-white w-4 h-4 rounded-full mr-2" />
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication (2FA) */}
      <div className="mt-6 p-6 border-t border-gray-800 bg-gray-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-gray-400">
              Protect your account from unauthorized entry by validating a 6-digit code from Google or Microsoft Authenticator.
            </p>
          </div>
          <button
            onClick={() => setIs2FaOpen(true)}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              user?.twoFactorEnabled
                ? 'bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/50'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Session Management */}
      <div className="mt-6 p-6 border-t border-gray-800 bg-gray-900/50">
        <SessionManager />
      </div>

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
