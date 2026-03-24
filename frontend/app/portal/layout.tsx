'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Ship,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface MemberInfo {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  role: string;
  status: string;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 检查是否是公开页面（不需要登录）
  const isPublicPage = pathname === '/portal/login' || pathname === '/portal/login/' ||
                       pathname === '/portal/register' || pathname === '/portal/register/';

  useEffect(() => {
    // 公开页面跳过认证检查
    if (isPublicPage) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('memberToken');
    const info = localStorage.getItem('memberInfo');

    if (!token) {
      router.push('/portal/login');
      return;
    }

    if (info) {
      setMemberInfo(JSON.parse(info));
    }
    setLoading(false);
  }, [router, pathname, isPublicPage]);

  const handleLogout = () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberInfo');
    router.push('/portal/login');
  };

  const navItems = [
    { label: 'Overview', href: '/portal/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/portal/orders', icon: Package },
    { label: 'Freight Rates', href: '/portal/freight-rates', icon: Ship },
    { label: 'Profile', href: '/portal/profile', icon: User },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  if (loading && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F7' }}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!memberInfo && !isPublicPage) {
    return null;
  }

  // 公开页面（登录/注册）直接渲染内容，不使用 portal 布局
  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F5F7' }}>
      {/* 桌面端侧边栏 */}
      <aside
        className="hidden lg:flex w-64 flex-col fixed h-full"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#1D1D1F' }}
            >
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#1D1D1F' }}>
                Cargo GM
              </div>
              <div className="text-xs" style={{ color: '#86868B' }}>
                Customer Portal
              </div>
            </div>
          </Link>
        </div>

        {/* 导航 */}
        <nav className="flex-1 p-4">
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-3 px-3"
            style={{ color: '#86868B' }}
          >
            Menu
          </div>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-150"
                style={{
                  background: active ? 'rgba(0,122,255,0.08)' : 'transparent',
                  color: active ? '#007AFF' : '#3A3A3C',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
                <span className="flex-1 text-sm">{item.label}</span>
                {active && <ChevronRight size={14} style={{ opacity: 0.4 }} />}
              </Link>
            );
          })}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-2"
            style={{ background: 'rgba(0,0,0,0.02)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #34C759, #248A3D)' }}
            >
              {memberInfo?.contactName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium truncate"
                style={{ color: '#1D1D1F' }}
              >
                {memberInfo?.companyName || 'Unknown Company'}
              </div>
              <div className="text-xs truncate" style={{ color: '#86868B' }}>
                {memberInfo?.contactName || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors duration-150"
            style={{ color: '#FF3B30' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255,59,48,0.08)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* 移动端顶部导航 */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#1D1D1F' }}
          >
            <Ship className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: '#1D1D1F' }}>
            Cargo GM
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.04)' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 pt-14"
          style={{ background: '#F5F5F7' }}
        >
          <nav className="p-4">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2"
                  style={{
                    background: active ? 'rgba(0,122,255,0.08)' : '#fff',
                    color: active ? '#007AFF' : '#3A3A3C',
                    fontWeight: active ? 600 : 400,
                    boxShadow: active ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <item.icon size={20} strokeWidth={active ? 2 : 1.5} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ color: '#FF3B30', background: '#fff' }}
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        {/* 桌面端顶部栏 */}
        <div
          className="hidden lg:flex h-14 items-center px-8 border-b sticky top-0 z-30"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(0,0,0,0.06)',
          }}
        >
          <div className="text-sm" style={{ color: '#86868B' }}>
            {navItems.find((n) => isActive(n.href))?.label || 'Customer Portal'}
          </div>
        </div>

        {/* 页面内容 */}
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
