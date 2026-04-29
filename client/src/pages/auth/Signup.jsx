import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Briefcase } from 'lucide-react';

const signupSchema = z
  .object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    const result = await signup(data.email, data.password, data.businessName);
    if (result.success) {
      toast.success(result.message || 'Signup successful! Please login.');
      navigate('/auth/login');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-surface2 to-background items-center justify-center p-12 border-r border-border">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
            InvoiceAI <span className="text-secondary">SaaS</span>
          </h1>
          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            Join thousands of Indian freelancers who are automating their billing and saving hours every week.
          </p>
          <div className="bg-surface p-6 rounded-2xl border border-border">
            <p className="text-white font-medium mb-2">"This tool saved me 10+ hours a month on client follow-ups."</p>
            <p className="text-text-secondary text-sm">— Rajesh K., Freelance Designer</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-purple-glow border border-border">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-text-secondary">Start your 14-day free trial</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="businessName">
                Business Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Briefcase size={18} />
                </span>
                <input
                  id="businessName"
                  type="text"
                  {...register('businessName')}
                  className="w-full pl-10 pr-4 py-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Acme Designs"
                />
              </div>
              {errors.businessName && <p className="mt-1 text-sm text-accent">{errors.businessName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-accent">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-accent">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Lock size={18} />
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="w-full pl-10 pr-4 py-3 bg-surface2 border border-border rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-accent">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg mt-6"
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6 text-text-secondary text-sm">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
