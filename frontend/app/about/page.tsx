'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Award, Users, Globe, Shield } from 'lucide-react';

// PC端关于页
function DesktopAboutPage() {
  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'We pursue excellence in every shipment, ensuring your cargo arrives safely and on time.'
    },
    {
      icon: Users,
      title: 'Relationships',
      description: 'Building long-term partnerships grounded in trust, respect, and mutual success.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting businesses across 200+ countries with reliable logistics solutions.'
    },
    {
      icon: Shield,
      title: 'Integrity',
      description: 'Maintaining transparency and accountability in every aspect of our operations.'
    }
  ];

  return (
    <>
      {/* Hero - Apple Style */}
      <section className="bg-[#1D1D1F] pt-32 pb-20 lg:pb-28">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <span className="text-[12px] font-semibold tracking-[0.5px] text-[#86868B] uppercase mb-4 block">
            About Us
          </span>
          <h1 className="text-[40px] lg:text-[56px] font-bold text-white mb-6 max-w-3xl tracking-[-1px] leading-tight">
            Built on Trust,
            <br />
            Driven by Excellence
          </h1>
          <p className="text-[17px] text-[#86868B] max-w-2xl leading-relaxed">
            As an Indigenous-owned company with over 50 years of combined management experience, our team delivers freight solutions that reflect both cultural integrity and global capability.
          </p>
        </div>
      </section>

      {/* Our Story - Full Bleed Split */}
      <section className="relative">
        <div className="flex flex-col lg:flex-row">
          {/* Left - Full bleed image */}
          <div className="lg:w-1/2 h-[480px] lg:h-[680px]">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&h=900&fit=crop"
              alt="Logistics warehouse"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right - Content */}
          <div className="lg:w-1/2 bg-white flex items-center">
            <div className="p-10 lg:p-16 xl:p-20 max-w-[620px]">
              <span className="micro-label mb-4 block">Our Story</span>
              <h2 className="text-[36px] lg:text-[48px] font-bold text-[#1D1D1F] tracking-[-1px] leading-tight mb-6">
                Indigenous Values Meet
                <br />
                Modern Logistics
              </h2>
              <div className="space-y-4 text-[#6E6E73] text-[16px] leading-relaxed">
                <p>
                  Grounded in the principles of respect, trust, and relationship, Carggo GM bridges traditional Indigenous values with contemporary logistics solutions.
                </p>
                <p>
                  Our leadership team brings over 50 years of combined experience in freight forwarding, customs brokerage, and supply chain management. This expertise, paired with our commitment to excellence, enables us to deliver world-class logistics services while honouring our heritage.
                </p>
                <p>
                  We believe business success and cultural values can go hand in hand. Our approach emphasises long-term relationships, transparent communication, and sustainable practices that benefit our clients, communities, and the environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Apple Style Cards */}
      <section className="bg-[#F5F5F7] py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="micro-label mb-4 block">Our Values</span>
            <h2 className="section-title">What We Stand For</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-[20px] p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-14 h-14 bg-[#007AFF]/10 rounded-[16px] flex items-center justify-center mb-5"
                >
                  <value.icon size={26} className="text-[#007AFF]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#1D1D1F] mb-3">{value.title}</h3>
                <p className="text-[14px] text-[#6E6E73] leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats - Apple Style */}
      <section className="bg-[#1D1D1F] py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '50+', label: 'Years Experience' },
              { value: '200+', label: 'Countries Covered' },
              { value: '99%', label: 'On-Time Delivery' },
              { value: '24/7', label: 'Customer Support' }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center ${index < 3 ? 'lg:border-r lg:border-white/10' : ''}`}
              >
                <div className="text-[36px] lg:text-[48px] font-bold text-white tracking-[-1px] mb-2">
                  {stat.value}
                </div>
                <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team - Apple Style */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="micro-label mb-4 block">Leadership</span>
            <h2 className="section-title">Meet Our Team</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'To Be Announced', role: 'General Manager' },
              { name: 'To Be Announced', role: 'Operations Manager' },
              { name: 'To Be Announced', role: 'Business Development' }
            ].map((member, idx) => (
              <div key={idx} className="text-center">
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-[#F5F5F7] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-[40px] text-[#C7C7CC]">?</span>
                </div>
                <h3 className="text-[18px] font-semibold text-[#1D1D1F] mb-1">{member.name}</h3>
                <p className="text-[14px] text-[#6E6E73]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Apple Style */}
      <section className="bg-[#007AFF] py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <span className="text-[12px] font-semibold tracking-[0.5px] text-white/70 uppercase mb-4 block">
            Let's Work Together
          </span>
          <h2 className="text-[36px] lg:text-[48px] font-bold text-white mb-6 tracking-[-0.5px]">
            Ready to Partner With Us?
          </h2>
          <p className="text-[17px] text-white/80 mb-10 max-w-xl mx-auto">
            Let us show you how our experience and values can benefit your business.
          </p>
          <Link
            href="/contact/"
            className="inline-flex items-center gap-2 bg-white text-[#007AFF] px-8 py-4 rounded-full text-[16px] font-semibold hover:bg-white/90 transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            Contact Us
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </>
  );
}

// 移动端关于页
function MobileAboutPage() {
  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'We pursue excellence in every shipment, ensuring your cargo arrives safely and on time.'
    },
    {
      icon: Users,
      title: 'Relationships',
      description: 'Building long-term partnerships grounded in trust, respect, and mutual success.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting businesses across 200+ countries with reliable logistics solutions.'
    },
    {
      icon: Shield,
      title: 'Integrity',
      description: 'Maintaining transparency and accountability in every aspect of our operations.'
    }
  ];

  return (
    <div className="mobile-about">
      {/* Mobile Hero */}
      <section className="bg-[#1D1D1F] pt-24 pb-12 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#86868B] mb-3 block">
          About Us
        </span>
        <h1 className="text-[28px] font-bold text-white mb-4 tracking-[-0.5px] leading-tight">
          Built on Trust, Driven by Excellence
        </h1>
        <p className="text-[14px] text-[#86868B] leading-relaxed">
          As an Indigenous-owned company with over 50 years of combined management experience.
        </p>
      </section>

      {/* Story Section */}
      <section className="bg-white py-10 px-5">
        <div className="h-[200px] rounded-2xl overflow-hidden mb-6">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop"
            alt="Logistics warehouse"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-2 block">
          Our Story
        </span>
        <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-4">
          Indigenous Values Meet Modern Logistics
        </h2>
        <div className="space-y-3 text-[14px] text-[#6E6E73] leading-relaxed">
          <p>
            Grounded in the principles of respect, trust, and relationship, Carggo GM bridges traditional Indigenous values with contemporary logistics solutions.
          </p>
          <p>
            Our leadership team brings over 50 years of combined experience in freight forwarding, customs brokerage, and supply chain management.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#F5F5F7] py-10 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-2 block">
          Our Values
        </span>
        <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-6">
          What We Stand For
        </h2>

        <div className="flex flex-col gap-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-white rounded-2xl p-5"
            >
              <div className="w-12 h-12 bg-[#007AFF]/10 rounded-xl flex items-center justify-center mb-4">
                <value.icon size={24} className="text-[#007AFF]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1D1D1F] mb-2">{value.title}</h3>
              <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#1D1D1F] py-8 px-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '50+', label: 'Years Experience' },
            { value: '200+', label: 'Countries' },
            { value: '99%', label: 'On-Time' },
            { value: '24/7', label: 'Support' }
          ].map((stat) => (
            <div key={stat.label} className="text-center py-4">
              <div className="text-[28px] font-bold text-white tracking-[-0.5px] mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white py-10 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-2 block">
          Leadership
        </span>
        <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-6">
          Meet Our Team
        </h2>

        <div className="flex flex-col gap-6">
          {[
            { name: 'To Be Announced', role: 'General Manager' },
            { name: 'To Be Announced', role: 'Operations Manager' },
            { name: 'To Be Announced', role: 'Business Development' }
          ].map((member, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[24px] text-[#C7C7CC]">?</span>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#1D1D1F]">{member.name}</h3>
                <p className="text-[13px] text-[#6E6E73]">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#007AFF] py-12 px-5">
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-white mb-3">
            Ready to Partner?
          </h2>
          <p className="text-[14px] text-white/80 mb-6">
            Let us show you how our experience can benefit your business.
          </p>
          <Link
            href="/contact/"
            className="inline-flex items-center gap-2 bg-white text-[#007AFF] px-8 py-4 rounded-full text-[15px] font-semibold active:scale-95 transition-transform"
          >
            Contact Us
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}

// 主页面组件 - 自动检测设备类型
export default function AboutPage() {
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

  if (!mounted) {
    return <div className="min-h-screen bg-[#F5F5F7]" />;
  }

  return isMobile ? <MobileAboutPage /> : <DesktopAboutPage />;
}
