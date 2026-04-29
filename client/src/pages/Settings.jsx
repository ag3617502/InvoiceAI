import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import { User, Shield, Key, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    businessName: '',
    businessType: 'freelancer',
    phone: '',
    gstNumber: '',
    panNumber: '',
    currency: 'INR',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data.data;
        setProfileData({
          businessName: data.businessName || '',
          businessType: data.businessType || 'freelancer',
          phone: data.phone || '',
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          currency: data.currency || 'INR',
          address: {
            line1: data.address?.line1 || '',
            line2: data.address?.line2 || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            pincode: data.address?.pincode || '',
          },
        });
        updateUser(data);
      } catch (error) {
        console.error('Failed to load user info', error);
      }
    };
    fetchProfile();
  }, [updateUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      toast.success('Profile updated successfully!');
      updateUser(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Account Settings</h1>
        <p className="text-text-secondary">Manage your business identities, currencies, and credential metrics.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {[
          { id: 'profile', name: 'Business Profile', icon: <User size={16} /> },
          { id: 'security', name: 'Security Preferences', icon: <Key size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-surface2 text-text-primary border border-primary shadow-purple-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            {tab.icon} <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="bg-surface p-6 rounded-2xl border border-border space-y-6">
            <h2 className="text-xl font-bold text-text-primary">Business Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Business / Freelancer Name</label>
                <input
                  type="text"
                  required
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Business Type</label>
                <select
                  value={profileData.businessType}
                  onChange={(e) => setProfileData({ ...profileData, businessType: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="freelancer">Freelancer</option>
                  <option value="agency">Agency</option>
                  <option value="company">Company</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Contact Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="+91 99999 99999"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Default Currency</label>
                <select
                  value={profileData.currency}
                  onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={profileData.gstNumber}
                  onChange={(e) => setProfileData({ ...profileData, gstNumber: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="15-char GSTIN"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">PAN Number</label>
                <input
                  type="text"
                  value={profileData.panNumber}
                  onChange={(e) => setProfileData({ ...profileData, panNumber: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="10-char PAN"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase">Business Address</h3>
              
              <div>
                <label className="block text-xs text-text-secondary mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={profileData.address.line1}
                  onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, line1: e.target.value } })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="Office/Building"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={profileData.address.line2}
                  onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, line2: e.target.value } })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="Street/Locality"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">City</label>
                  <input
                    type="text"
                    value={profileData.address.city}
                    onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, city: e.target.value } })}
                    className="w-full p-2.5 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">State</label>
                  <input
                    type="text"
                    value={profileData.address.state}
                    onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, state: e.target.value } })}
                    className="w-full p-2.5 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Pincode</label>
                  <input
                    type="text"
                    value={profileData.address.pincode}
                    onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, pincode: e.target.value } })}
                    className="w-full p-2.5 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className="bg-surface p-6 rounded-2xl border border-border space-y-6">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Shield className="text-accent" /> Authentication Credentials
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <label className="block text-sm text-text-secondary mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-white font-semibold rounded-xl hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Credentials'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
