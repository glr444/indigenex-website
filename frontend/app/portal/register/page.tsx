'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ship,
  Mail,
  Lock,
  Building2,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/member/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          contactName: formData.contactName,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F5F5F7' }}>
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{ background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: '#E8F5E9' }}
          >
            <CheckCircle size={32} style={{ color: '#34C759' }} />
          </div>
          <h1
            className="text-2xl font-semibold mb-4"
            style={{ color: '#1D1D1F', letterSpacing: '-0.3px' }}
          >
            Registration Successful
          </h1>
          <p className="mb-6" style={{ color: '#86868B', fontSize: 15 }}>
            Your registration has been submitted. You will receive your login credentials via email once approved by an administrator.
          </p>
          <Link
            href="/portal/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-200"
            style={{ background: '#007AFF' }}
          >
            Return to Login
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F5F7' }}>
      {/* 左侧 - 品牌展示 */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1D1D1F 0%, #2D2D2F 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <Ship className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">
              Cargo GM Customer Portal
            </span>
          </div>

          <h1
            className="text-4xl font-bold text-white mb-6 leading-tight"
            style={{ letterSpacing: '-0.5px' }}
          >
            Start Your<br />
            Global Logistics Journey
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed">
            Register as a member to enjoy convenient online services: freight rate inquiries, order tracking, and logistics management.
          </p>
        </div>
      </div>

      {/* 右侧 - 注册表单 */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 overflow-auto">
        <div className="max-w-md w-full mx-auto">
          {/* 移动端 Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#1D1D1F' }}
            >
              <Ship className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>
              Cargo GM Customer Portal
            </span>
          </div>

          <div className="mb-8">
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: '#1D1D1F', letterSpacing: '-0.3px' }}
            >
              Create Account
            </h2>
            <p style={{ color: '#86868B', fontSize: 15 }}>
              Complete the following information to register
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{ background: '#FFE5E5' }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FF3B30' }} />
              <span style={{ color: '#FF3B30', fontSize: 14 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3A3A3C' }}>
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#86868B' }} />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 outline-none"
                  style={{
                    borderColor: 'rgba(0,0,0,0.08)',
                    fontSize: 15,
                    background: '#fff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007AFF'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>
            </div>

            {/* Contact Person */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3A3A3C' }}>
                  Contact Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#86868B' }} />
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 outline-none"
                    style={{
                      borderColor: 'rgba(0,0,0,0.08)',
                      fontSize: 15,
                      background: '#fff'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007AFF'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3A3A3C' }}>
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#86868B' }} />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 outline-none"
                    style={{
                      borderColor: 'rgba(0,0,0,0.08)',
                      fontSize: 15,
                      background: '#fff'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007AFF'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3A3A3C' }}>
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#86868B' }} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 outline-none"
                  style={{
                    borderColor: 'rgba(0,0,0,0.08)',
                    fontSize: 15,
                    background: '#fff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007AFF'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3A3A3C' }}>
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#86868B' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border transition-all duration-200 outline-none"
                  style={{
                    borderColor: 'rgba(0,0,0,0.08)',
                    fontSize: 15,
                    background: '#fff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007AFF'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#86868B' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3A3A3C' }}>
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#86868B' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Enter password again"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 outline-none"
                  style={{
                    borderColor: 'rgba(0,0,0,0.08)',
                    fontSize: 15,
                    background: '#fff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007AFF'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: loading ? 'rgba(0,122,255,0.7)' : '#007AFF',
                fontSize: 16,
                boxShadow: '0 4px 14px rgba(0, 122, 255, 0.35)'
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Submit Registration
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p style={{ color: '#86868B', fontSize: 14 }}>
              Already have an account?{' '}
              <Link href="/portal/login" className="font-medium hover:underline" style={{ color: '#007AFF' }}>
                Login now
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <p className="text-center text-xs" style={{ color: '#86868B' }}>
              By submitting registration, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
