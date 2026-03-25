'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ship, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import TechWaveBackground from '../../components/TechWaveBackground';

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/member/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('memberToken', data.data.token);
        localStorage.setItem('memberInfo', JSON.stringify(data.data.member));
        router.push('/portal/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F5F7' }}>
      {/* 左侧 - 品牌展示（科技波浪背景） */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* 科技波浪动态背景 */}
        <TechWaveBackground />

        {/* 渐变遮罩 - 增强文字可读性 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,15,0.4) 100%)'
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
            Global Logistics<br />
            One-Stop Service Platform
          </h1>

          <p className="text-lg text-gray-300 leading-relaxed">
            Track freight rates, monitor orders, and manage logistics nodes — making your international shipping more convenient and efficient.
          </p>

          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-white">200+</div>
              <div className="text-sm text-gray-400 mt-1">Ports Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-gray-400 mt-1">Partner Carriers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400 mt-1">Online Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧 - 登录表单 */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16">
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
              Welcome Back
            </h2>
            <p style={{ color: '#86868B', fontSize: 15 }}>
              Please enter your account information
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
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#3A3A3C' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: '#86868B' }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#3A3A3C' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: '#86868B' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span style={{ color: '#86868B', fontSize: 14 }}>Remember me</span>
              </label>
              <Link
                href="#"
                className="text-sm hover:underline"
                style={{ color: '#007AFF' }}
              >
                Forgot password?
              </Link>
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
                  Login
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p style={{ color: '#86868B', fontSize: 14 }}>
              Don't have an account?{' '}
              <Link
                href="/portal/register"
                className="font-medium hover:underline"
                style={{ color: '#007AFF' }}
              >
                Register now
              </Link>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <p className="text-center text-sm" style={{ color: '#86868B' }}>
              Administrator approval required after registration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
