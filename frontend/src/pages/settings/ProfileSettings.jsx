import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Check, ShieldCheck, Sparkles, Camera, BadgeCheck } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';

const ProfileSettings = () => {
  const { user, login } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const updatedUser = await userService.updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      if (login && updatedUser?.token) {
        login(updatedUser.token, updatedUser);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile details' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userInitials = formData.fullName
    ? formData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  return (
    <Card className="p-7 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl space-y-8">
      {/* Profile Header & Avatar Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary-light to-accent flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary/20 border border-white/20">
              {userInitials}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text">{formData.fullName || 'User Profile'}</h2>
              <BadgeCheck className="w-5 h-5 text-primary fill-primary/20" />
            </div>
            <p className="text-xs text-text-muted mt-0.5">{formData.email || 'user@aetheria.dev'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
                Level {user?.level || 1} Workspace
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-success/15 border border-success/20 text-success flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-text-muted hidden md:block">
          <span className="block font-semibold text-text">Account Security</span>
          <span className="text-[11px] text-success flex items-center justify-end gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
          </span>
        </div>
      </div>

      {/* Alert Notification */}
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
          {message.type === 'success' && <Check className="w-4 h-4" />}
        </motion.div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        <Input
          id="fullName"
          name="fullName"
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          required
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
          required
          icon={<Mail className="w-4 h-4" />}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={!formData.fullName || !formData.email}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileSettings;
