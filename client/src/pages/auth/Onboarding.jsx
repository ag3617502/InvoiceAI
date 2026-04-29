import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, Settings, CheckCircle } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessType: 'freelancer',
    phone: '',
    address: { line1: '', line2: '', city: '', state: '', pincode: '' },
    gstNumber: '',
    invoicePrefix: 'INV',
    defaultTerms: 'Payment is due within 30 days.',
  });

  const navigate = useNavigate();

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateAddress = (field, value) => {
    setFormData({
      ...formData,
      address: { ...formData.address, [field]: value },
    });
  };

  const handleNext = async () => {
    try {
      // Save data on each step
      await api.patch('/auth/onboarding', formData);
      if (step < 4) {
        setStep(step + 1);
      } else {
        toast.success('Onboarding complete!');
        navigate('/app/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save onboarding data');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-surface p-8 rounded-2xl border border-border shadow-purple-glow">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 mx-1 rounded-full ${
                s <= step ? 'bg-primary' : 'bg-surface2'
              } transition-colors duration-300`}
            ></div>
          ))}
        </div>

        {/* Step 1: Business Type */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <Briefcase className="mx-auto text-primary mb-4" size={48} />
              <h2 className="text-3xl font-bold text-white mb-2">What best describes you?</h2>
              <p className="text-text-secondary">We'll tailor your experience based on your business type</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {['freelancer', 'agency', 'company'].map((type) => (
                <button
                  key={type}
                  onClick={() => updateField('businessType', type)}
                  className={`p-6 rounded-xl border ${
                    formData.businessType === type
                      ? 'border-primary bg-surface2 shadow-purple-glow'
                      : 'border-border bg-surface hover:border-text-muted'
                  } transition-all text-center capitalize`}
                >
                  <span className="text-lg font-semibold text-white">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Business Info */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <MapPin className="mx-auto text-secondary mb-4" size={48} />
              <h2 className="text-3xl font-bold text-white mb-2">Business Details</h2>
              <p className="text-text-secondary">Where should we send your invoices from?</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => updateField('gstNumber', e.target.value)}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Address Line 1</label>
                <input
                  type="text"
                  value={formData.address.line1}
                  onChange={(e) => updateAddress('line1', e.target.value)}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary"
                  placeholder="Street address, P.O. box"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => updateAddress('city', e.target.value)}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => updateAddress('state', e.target.value)}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary"
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.address.pincode}
                    onChange={(e) => updateAddress('pincode', e.target.value)}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary"
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Invoice Preferences */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <Settings className="mx-auto text-warning mb-4" size={48} />
              <h2 className="text-3xl font-bold text-white mb-2">Invoice Preferences</h2>
              <p className="text-text-secondary">Set your default invoicing options</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => updateField('invoicePrefix', e.target.value)}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary"
                  placeholder="INV"
                />
                <p className="text-text-muted text-xs mt-1">Example: {formData.invoicePrefix}-2026-0001</p>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Default Terms & Conditions</label>
                <textarea
                  value={formData.defaultTerms}
                  onChange={(e) => updateField('defaultTerms', e.target.value)}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary h-24"
                  placeholder="Payment is due within 30 days."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto text-success mb-4 animate-bounce" size={64} />
            <h2 className="text-4xl font-bold text-white mb-4">You're all set!</h2>
            <p className="text-text-secondary text-lg mb-8">
              Your profile is configured. You're ready to start generating beautiful invoices.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && step < 4 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-surface2 text-white font-semibold rounded-xl border border-border hover:bg-border transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className={`px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-all ml-auto`}
          >
            {step === 4 ? 'Go to Dashboard' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
