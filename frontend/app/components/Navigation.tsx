'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // 检测是否在深色背景页面
  const isDarkBgPage = pathname?.startsWith('/portal/login') || pathname?.startsWith('/portal/register');

  useEffect(() => {
    // 页面加载完成后显示导航，避免闪烁
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about/' },
    { label: 'Services', href: '/services/' },
    { label: 'Countries', href: '/countries/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Portal', href: '/portal/login' },
  ];

  // 统一的导航样式 - 使用深色半透明背景确保所有页面一致
  const navClasses = isOpen
    ? 'bg-[#1D1D1F]/95 backdrop-blur-xl shadow-lg'
    : isDarkBgPage
      ? 'bg-[#1D1D1F]/60 backdrop-blur-md'
      : 'bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm';

  const textClasses = isOpen
    ? 'text-white'
    : isDarkBgPage
      ? 'text-white'
      : 'text-[#1D1D1F]';

  const itemClasses = isOpen
    ? 'text-white/90 hover:text-white hover:bg-white/10'
    : isDarkBgPage
      ? 'text-white/90 hover:text-white hover:bg-white/10'
      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/5';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className={`text-[16px] font-bold tracking-tight transition-colors duration-300 ${textClasses}`}>
            Carggo GM
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-[14px] font-medium rounded-full transition-all duration-200 ${itemClasses}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            href="/contact/"
            className="hidden md:flex items-center gap-1.5 bg-[#007AFF] text-white text-[14px] font-semibold px-5 py-2.5 rounded-full hover:bg-[#0051D5] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Get a Quote
          </Link>

          <button
            className={`md:hidden p-2 rounded-full transition-colors duration-200 ${textClasses} hover:bg-white/10`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>

        {isOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="md:hidden relative z-50 py-4 border-t border-white/10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-3 text-[15px] font-medium text-white/90 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact/"
                className="block mt-4 bg-[#007AFF] text-white text-center text-[14px] font-semibold px-5 py-3 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                Get a Quote
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
