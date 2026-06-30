import { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';

const ProfileSettings = () => {
  const { user, login } = useAuth(); // Assuming login or updateUser function exists to update context, we'll just reload or use what we have
  
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
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const updatedUser = await userService.updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully! Note: You may need to log in again if you changed your email.' });
      
      // Update the auth context if login method supports it or just let the user know
      if (login && updatedUser.token) { // If update profile returns a new token
        login(updatedUser.token, updatedUser);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-400" />
          Profile Information
        </h2>
        <p className="text-sm text-gray-400 mt-1">Update your account's profile information and email address.</p>
      </div>

      <div className="p-6">
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/10 text-red-400 border border-red-500/50'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.fullName || !formData.email}
              className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-spin border-2 border-white/20 border-t-white w-4 h-4 rounded-full mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
