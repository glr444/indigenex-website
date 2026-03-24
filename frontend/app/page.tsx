'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plane, Ship, Truck, TrainFront, ArrowUpRight, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';

// PC端首页组件
function DesktopHomePage() {
  const services = [
    {
      icon: Plane,
      title: 'Air Freight',
      description: 'Express air cargo with door-to-door delivery, customs clearance, and real-time tracking worldwide.',
      color: '#007AFF',
    },
    {
      icon: Ship,
      title: 'Ocean Freight',
      description: 'Global port coverage with freight booking, cargo coordination, and customs clearance support.',
      color: '#00B8D4',
    },
    {
      icon: Truck,
      title: 'Road Freight',
      description: 'Nationwide road distribution including cross-border transport, dangerous goods, and warehousing.',
      color: '#FF9500',
    },
    {
      icon: TrainFront,
      title: 'Rail Shipments',
      description: 'Australia-wide rail freight for heavy cargo with temperature control and eco-friendly options.',
      color: '#34C759',
    },
  ];

  const stats = [
    { value: '50+', label: 'Years Experience' },
    { value: '200+', label: 'Countries Covered' },
    { value: '24/7', label: 'Real-Time Tracking' },
    { value: '100%', label: 'Door-to-Door Service' },
  ];

  return (
    <>
      {/* Hero Section - Full Screen Background Image */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&h=1080&fit=crop"
            alt="Cargo container ship"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center">
          <div className="max-w-[700px]">
            <span className="inline-block text-[12px] font-semibold tracking-[2px] uppercase text-white/70 mb-6 border-l-2 border-[#007AFF] pl-4">
              Indigenous-Owned · 50+ Years Experience
            </span>
            <h1 className="text-[52px] lg:text-[72px] font-bold leading-[1.05] tracking-[-2px] text-white mb-6">
              Bridging Tradition
              <br />
              <span className="text-[#007AFF]">&</span> Modern Logistics
            </h1>
            <p className="text-[18px] lg:text-[20px] text-white/80 leading-relaxed mb-10 max-w-[560px]">
              50+ years of combined experience delivering reliable freight solutions across air, ocean, road, and rail.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services/"
                className="inline-flex items-center gap-2 bg-[#007AFF] text-white px-8 py-4 rounded-full text-[15px] font-semibold hover:bg-[#0051D5] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Explore Services
                <ChevronRight size={18} strokeWidth={2.5} />
              </Link>
              <Link
                href="/about/"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full text-[15px] font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar - Overlapping */}
        <div className="absolute bottom-0 left-0 right-0 bg-white">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`py-8 px-6 lg:px-8 ${index < 3 ? 'border-r border-[#E5E5E5]' : ''}`}
                >
                  <div className="text-[36px] lg:text-[48px] font-bold text-[#1D1D1F] tracking-[-1px] leading-none mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-semibold tracking-[1px] text-[#86868B] uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Full Width Cards */}
      <section className="bg-[#F5F5F7] py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
            <div>
              <span className="text-[12px] font-semibold tracking-[2px] uppercase text-[#007AFF] mb-3 block">
                What We Do
              </span>
              <h2 className="text-[36px] lg:text-[48px] font-bold text-[#1D1D1F] tracking-[-1px]">
                Comprehensive Freight Solutions
              </h2>
            </div>
            <Link
              href="/services/"
              className="mt-6 lg:mt-0 inline-flex items-center gap-2 text-[15px] font-semibold text-[#007AFF] hover:gap-3 transition-all"
            >
              View All Services
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Service Cards - Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 rounded-[20px] overflow-hidden shadow-xl">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`group bg-white p-8 lg:p-10 hover:bg-[#1D1D1F] transition-all duration-500 ${index < 3 ? 'border-r border-[#E5E5E5]' : ''}`}
              >
                <div
                  className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-8 transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <service.icon size={28} style={{ color: service.color }} strokeWidth={1.5} />
                </div>

                <h3 className="text-[22px] font-bold text-[#1D1D1F] mb-4 group-hover:text-white transition-colors">
                  {service.title}
                </h3>

                <p className="text-[15px] text-[#6E6E73] leading-relaxed mb-8 group-hover:text-white/70 transition-colors">
                  {service.description}
                </p>

                <Link
                  href="/services/"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#007AFF] group-hover:text-white transition-colors"
                >
                  Learn More
                  <ArrowUpRight size={16} strokeWidth={2} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Full Width Image Background */}
      <section className="relative py-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left - Image */}
          <div className="lg:w-1/2 h-[400px] lg:h-[600px]">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop"
              alt="Logistics warehouse"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right - Content */}
          <div className="lg:w-1/2 bg-[#1D1D1F] flex items-center">
            <div className="p-10 lg:p-16 xl:p-20 max-w-[640px]">
              <span className="text-[12px] font-semibold tracking-[2px] uppercase text-[#007AFF] mb-4 block">
                Our Story
              </span>
              <h2 className="text-[36px] lg:text-[48px] font-bold text-white tracking-[-1px] leading-tight mb-6">
                Built on Trust,
                <br />
                Driven by Excellence
              </h2>
              <p className="text-[17px] text-white/70 leading-relaxed mb-8">
                As an Indigenous-owned company with over 50 years of combined management experience,
                we bring traditional values of trust, respect, and relationship to modern logistics.
                Our team delivers freight solutions that reflect both cultural integrity and global capability.
              </p>
              <Link
                href="/about/"
                className="inline-flex items-center gap-2 bg-white text-[#1D1D1F] px-8 py-4 rounded-full text-[15px] font-semibold hover:bg-[#F5F5F7] transition-all duration-200"
              >
                Learn More About Us
                <ChevronRight size={18} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Width Blue */}
      <section className="relative bg-[#007AFF] py-24 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <span className="text-[12px] font-semibold tracking-[2px] uppercase text-white/60 mb-4 block">
            Ready to Ship?
          </span>
          <h2 className="text-[42px] lg:text-[64px] font-bold text-white tracking-[-2px] leading-tight mb-6">
            Ready to Ship?
          </h2>
          <p className="text-[18px] lg:text-[20px] text-white/80 mb-10 max-w-[500px] mx-auto">
            Get a free quote within 48 hours. Let's discuss your logistics needs.
          </p>
          <Link
            href="/contact/"
            className="inline-flex items-center gap-3 bg-white text-[#007AFF] px-10 py-5 rounded-full text-[17px] font-semibold hover:bg-[#F5F5F7] transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Get a Quote
            <ArrowUpRight size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </>
  );
}

// 移动端首页组件
function MobileHomePage() {
  const services = [
    {
      icon: Plane,
      title: 'Air Freight',
      description: 'Express air cargo with door-to-door delivery worldwide.',
      color: '#007AFF',
    },
    {
      icon: Ship,
      title: 'Ocean Freight',
      description: 'Global port coverage with freight booking.',
      color: '#00B8D4',
    },
    {
      icon: Truck,
      title: 'Road Freight',
      description: 'Nationwide road distribution & warehousing.',
      color: '#FF9500',
    },
    {
      icon: TrainFront,
      title: 'Rail Shipments',
      description: 'Eco-friendly rail freight for heavy cargo.',
      color: '#34C759',
    },
  ];

  const stats = [
    { value: '50+', label: 'Years' },
    { value: '200+', label: 'Countries' },
    { value: '24/7', label: 'Tracking' },
    { value: '100%', label: 'Service' },
  ];

  return (
    <div className="mobile-home">
      {/* Mobile Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=1200&fit=crop"
            alt="Cargo container ship"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>

        {/* Content */}
        <div className="relative px-5 pb-8">
          <span className="inline-block text-[11px] font-semibold tracking-[1.5px] uppercase text-white/70 mb-4 border-l-2 border-[#007AFF] pl-3">
            Indigenous-Owned
          </span>
          <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.5px] text-white mb-4">
            Bridging Tradition
            <span className="text-[#007AFF]"> & </span>
            Modern Logistics
          </h1>
          <p className="text-[15px] text-white/80 leading-relaxed mb-6">
            50+ years delivering reliable freight solutions across air, ocean, road, and rail.
          </p>

          {/* CTA Buttons - Stacked for mobile */}
          <div className="flex flex-col gap-3">
            <Link
              href="/contact/"
              className="flex items-center justify-center gap-2 bg-[#007AFF] text-white px-6 py-4 rounded-full text-[15px] font-semibold active:scale-95 transition-transform"
            >
              Get a Quote
              <ChevronRight size={18} strokeWidth={2.5} />
            </Link>
            <Link
              href="/services/"
              className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md text-white px-6 py-4 rounded-full text-[15px] font-semibold border border-white/20 active:scale-95 transition-transform"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar - Horizontal Scroll */}
      <section className="bg-white py-6 -mt-1 relative z-10">
        <div className="flex overflow-x-auto px-5 gap-4 scrollbar-hide">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-shrink-0 bg-[#F5F5F7] rounded-2xl px-5 py-4 min-w-[100px] text-center"
            >
              <div className="text-[28px] font-bold text-[#1D1D1F] tracking-[-0.5px]">
                {stat.value}
              </div>
              <div className="text-[10px] font-semibold tracking-[0.5px] text-[#86868B] uppercase mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section - Card Stack */}
      <section className="bg-[#F5F5F7] py-10 px-5">
        <div className="mb-6">
          <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-2 block">
            What We Do
          </span>
          <h2 className="text-[24px] font-bold text-[#1D1D1F] tracking-[-0.5px]">
            Freight Solutions
          </h2>
        </div>

        {/* Service Cards - Vertical Stack */}
        <div className="flex flex-col gap-4">
          {services.map((service) => (
            <Link
              key={service.title}
              href="/services/"
              className="group bg-white rounded-2xl p-5 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <service.icon size={24} style={{ color: service.color }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-bold text-[#1D1D1F] mb-1">
                    {service.title}
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <ArrowUpRight
                  size={20}
                  className="text-[#007AFF] flex-shrink-0 mt-1"
                  strokeWidth={2}
                />
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/services/"
          className="mt-6 flex items-center justify-center gap-2 text-[14px] font-semibold text-[#007AFF] py-3"
        >
          View All Services
          <ArrowUpRight size={16} strokeWidth={2.5} />
        </Link>
      </section>

      {/* About Section - Compact */}
      <section className="bg-[#1D1D1F] py-10 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-3 block">
          Our Story
        </span>
        <h2 className="text-[24px] font-bold text-white tracking-[-0.5px] leading-tight mb-4">
          Built on Trust
        </h2>
        <p className="text-[14px] text-white/70 leading-relaxed mb-6">
          As an Indigenous-owned company with 50+ years of experience, we bring traditional values of trust and respect to modern logistics.
        </p>
        <Link
          href="/about/"
          className="inline-flex items-center gap-2 bg-white text-[#1D1D1F] px-6 py-3.5 rounded-full text-[14px] font-semibold active:scale-95 transition-transform"
        >
          About Us
          <ChevronRight size={16} strokeWidth={2.5} />
        </Link>
      </section>

      {/* Quick Contact - Mobile Optimized */}
      <section className="bg-white py-10 px-5">
        <h2 className="text-[20px] font-bold text-[#1D1D1F] mb-6 text-center">
          Get in Touch
        </h2>

        <div className="flex flex-col gap-3">
          <a
            href="tel:+61200000000"
            className="flex items-center gap-4 bg-[#F5F5F7] rounded-2xl p-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
              <Phone size={18} className="text-[#007AFF]" />
            </div>
            <div>
              <div className="text-[12px] text-[#86868B] mb-0.5">Call Us</div>
              <div className="text-[15px] font-semibold text-[#1D1D1F]">+61 2 XXXX XXXX</div>
            </div>
          </a>

          <a
            href="mailto:info@carggo.com"
            className="flex items-center gap-4 bg-[#F5F5F7] rounded-2xl p-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
              <Mail size={18} className="text-[#007AFF]" />
            </div>
            <div>
              <div className="text-[12px] text-[#86868B] mb-0.5">Email Us</div>
              <div className="text-[15px] font-semibold text-[#1D1D1F]">info@carggo.com</div>
            </div>
          </a>

          <Link
            href="/contact/"
            className="flex items-center gap-4 bg-[#007AFF] rounded-2xl p-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[12px] text-white/70 mb-0.5">Visit Us</div>
              <div className="text-[15px] font-semibold text-white">Send Message →</div>
            </div>
          </Link>
        </div>
      </section>

      {/* CTA Section - Full Width */}
      <section className="relative bg-[#007AFF] py-12 px-5 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative text-center">
          <h2 className="text-[28px] font-bold text-white tracking-[-0.5px] mb-3">
            Ready to Ship?
          </h2>
          <p className="text-[14px] text-white/80 mb-6 max-w-[280px] mx-auto">
            Get a free quote within 48 hours.
          </p>
          <Link
            href="/contact/"
            className="inline-flex items-center gap-2 bg-white text-[#007AFF] px-8 py-4 rounded-full text-[15px] font-semibold active:scale-95 transition-transform shadow-lg"
          >
            Get a Quote
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* Mobile Footer - Simplified */}
      <footer className="bg-[#1D1D1F] py-8 px-5">
        <div className="text-center">
          <div className="text-[20px] font-bold text-white mb-2">Carggo GM</div>
          <p className="text-[12px] text-white/50 mb-4">
            Bridging Tradition & Modern Logistics
          </p>
          <div className="flex justify-center gap-6 text-[12px] text-white/70">
            <Link href="/about/" className="active:text-white">About</Link>
            <Link href="/services/" className="active:text-white">Services</Link>
            <Link href="/contact/" className="active:text-white">Contact</Link>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-[11px] text-white/40">
            © 2024 Carggo GM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// 主页面组件 - 自动检测设备类型
export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 防止服务端渲染不匹配，在挂载前显示加载状态
  if (!mounted) {
    return <div className="min-h-screen bg-[#F5F5F7]" />;
  }

  return isMobile ? <MobileHomePage /> : <DesktopHomePage />;
}
