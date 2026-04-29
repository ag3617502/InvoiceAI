import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Login successful!');
      navigate(from, { replace: true });
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
            The ultimate invoicing and billing solution designed specifically for Indian freelancers and agencies.
          </p>
          <ul className="space-y-4 text-text-primary">
            <li className="flex items-center space-x-3">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              <span>AI-Powered Proposal & Invoice Generation</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="h-2 w-2 rounded-full bg-secondary"></span>
              <span>GST & Tax Estimation Made Easy</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="h-2 w-2 rounded-full bg-accent"></span>
              <span>Smart Payment Reminders via WhatsApp</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-purple-glow border border-border">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-text-secondary">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-surface2 border-border rounded text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                  Remember me
                </label>
              </div>
              <Link to="/auth/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-8 text-text-secondary text-sm">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
