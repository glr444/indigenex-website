'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plane, Ship, Truck, TrainFront, Package, FileCheck, Clock, ChevronRight } from 'lucide-react';

// PC端服务页
function DesktopServicesPage() {
  const mainServices = [
    {
      icon: Plane,
      title: 'Air Freight',
      description: 'Door-to-door express air cargo to 200+ countries, including customs clearance and real-time tracking.',
      features: ['Door-to-Door Delivery', 'Customs Clearance', 'Real-Time Tracking', 'Express Options'],
      gradient: 'from-blue-500/10 to-blue-600/5',
      iconColor: '#007AFF',
    },
    {
      icon: Ship,
      title: 'Ocean Freight',
      description: 'Full container and LCL ocean freight with global port coverage and end-to-end logistics support.',
      features: ['FCL & LCL', 'Global Port Coverage', 'Freight Booking', 'Cargo Coordination'],
      gradient: 'from-cyan-500/10 to-cyan-600/5',
      iconColor: '#00B8D4',
    },
    {
      icon: Truck,
      title: 'Road Freight',
      description: 'Nationwide road distribution including cross-border transport, dangerous goods, and warehousing solutions.',
      features: ['Cross-Border Transport', 'Dangerous Goods', 'Warehousing', 'Last-Mile Delivery'],
      gradient: 'from-orange-500/10 to-orange-600/5',
      iconColor: '#FF9500',
    },
    {
      icon: TrainFront,
      title: 'Rail Freight',
      description: 'Australia-wide rail freight for heavy cargo with temperature control and eco-friendly transport options.',
      features: ['Heavy Cargo Specialist', 'Temperature Control', 'Eco-Friendly', 'Cost Effective'],
      gradient: 'from-green-500/10 to-green-600/5',
      iconColor: '#34C759',
    }
  ];

  const additionalServices = [
    {
      icon: Package,
      title: 'Warehousing',
      description: 'Secure storage and inventory management solutions'
    },
    {
      icon: FileCheck,
      title: 'Customs Brokerage',
      description: 'Expert handling of customs documentation and compliance'
    },
    {
      icon: Clock,
      title: 'Express Delivery',
      description: 'Urgent freight transport for time-critical shipments'
    }
  ];

  return (
    <>
      {/* Hero - Apple Style */}
      <section className="bg-[#1D1D1F] pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <span className="text-[12px] font-semibold tracking-[0.5px] text-[#86868B] uppercase mb-4 block">
            Our Services
          </span>
          <h1 className="text-[40px] lg:text-[56px] font-bold text-white mb-6 max-w-3xl tracking-[-1px] leading-tight">
            Comprehensive Freight Solutions
          </h1>
          <p className="text-[17px] text-[#86868B] max-w-2xl">
            From air to ocean, road to rail — we move your cargo anywhere in the world with reliability and care.
          </p>
        </div>
      </section>

      {/* Main Services - Apple Style Cards */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="micro-label mb-4 block">Core Services</span>
            <h2 className="section-title">How We Can Help</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mainServices.map((service) => (
              <div
                key={service.title}
                className="group relative bg-[#F5F5F7] rounded-[20px] p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-black/5"
              >
                <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${service.iconColor}15` }}
                  >
                    <service.icon size={28} style={{ color: service.iconColor }} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-[21px] font-semibold text-[#1D1D1F] mb-3">{service.title}</h3>
                  <p className="text-[15px] text-[#6E6E73] leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <ul className="space-y-2 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-[14px] text-[#6E6E73]">
                        <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact/"
                    className="inline-flex items-center gap-1 text-[15px] font-semibold text-[#007AFF] group-hover:gap-2 transition-all"
                  >
                    Get a Quote
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services - Apple Style */}
      <section className="bg-[#F5F5F7] py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="micro-label mb-4 block">Additional Services</span>
            <h2 className="section-title">Complete Logistics Support</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalServices.map((service) => (
              <div key={service.title} className="bg-white rounded-[20px] p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-[#007AFF]/10 rounded-[16px] flex items-center justify-center mx-auto mb-4">
                  <service.icon size={28} className="text-[#007AFF]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#1D1D1F] mb-2">{service.title}</h3>
                <p className="text-[14px] text-[#6E6E73]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process - Apple Style */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="micro-label mb-4 block">Our Process</span>
            <h2 className="section-title">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Request a Quote', desc: 'Tell us about your shipment' },
              { step: '02', title: 'We Plan', desc: 'We design a tailored logistics solution' },
              { step: '03', title: 'In Transit', desc: 'Your cargo is on its way' },
              { step: '04', title: 'Delivered', desc: 'On time, every time' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-[48px] font-bold text-[#F5F5F7] mb-4 leading-none">{item.step}</div>
                <h3 className="text-[19px] font-semibold text-[#1D1D1F] mb-2">{item.title}</h3>
                <p className="text-[14px] text-[#6E6E73]">{item.desc}</p>
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
            Ready to Ship?
          </span>
          <h2 className="text-[36px] lg:text-[48px] font-bold text-white mb-6 tracking-[-0.5px]">
            Get Your Free Quote
          </h2>
          <p className="text-[17px] text-white/80 mb-10 max-w-xl mx-auto">
            Contact us today and receive a detailed quote within 48 hours.
          </p>
          <Link
            href="/contact/"
            className="inline-flex items-center gap-2 bg-white text-[#007AFF] px-8 py-4 rounded-full text-[16px] font-semibold hover:bg-white/90 transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            Request a Quote
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </>
  );
}

// 移动端服务页
function MobileServicesPage() {
  const mainServices = [
    {
      icon: Plane,
      title: 'Air Freight',
      description: 'Door-to-door express air cargo to 200+ countries.',
      features: ['Door-to-Door', 'Customs Clearance', 'Real-Time Tracking'],
      iconColor: '#007AFF',
    },
    {
      icon: Ship,
      title: 'Ocean Freight',
      description: 'Full container and LCL ocean freight with global coverage.',
      features: ['FCL & LCL', 'Global Ports', 'Cargo Coordination'],
      iconColor: '#00B8D4',
    },
    {
      icon: Truck,
      title: 'Road Freight',
      description: 'Nationwide road distribution and warehousing.',
      features: ['Cross-Border', 'Dangerous Goods', 'Last-Mile'],
      iconColor: '#FF9500',
    },
    {
      icon: TrainFront,
      title: 'Rail Freight',
      description: 'Australia-wide rail for heavy cargo.',
      features: ['Heavy Cargo', 'Eco-Friendly', 'Cost Effective'],
      iconColor: '#34C759',
    }
  ];

  const additionalServices = [
    { icon: Package, title: 'Warehousing', description: 'Secure storage solutions' },
    { icon: FileCheck, title: 'Customs Brokerage', description: 'Documentation & compliance' },
    { icon: Clock, title: 'Express Delivery', description: 'Time-critical shipments' }
  ];

  return (
    <div className="mobile-services">
      {/* Mobile Hero */}
      <section className="bg-[#1D1D1F] pt-24 pb-12 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#86868B] mb-3 block">
          Our Services
        </span>
        <h1 className="text-[28px] font-bold text-white mb-4 tracking-[-0.5px] leading-tight">
          Comprehensive Freight Solutions
        </h1>
        <p className="text-[14px] text-[#86868B] leading-relaxed">
          From air to ocean, road to rail — we move your cargo anywhere in the world.
        </p>
      </section>

      {/* Main Services */}
      <section className="bg-white py-10 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-2 block">
          Core Services
        </span>
        <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-6">
          How We Can Help
        </h2>

        <div className="flex flex-col gap-4">
          {mainServices.map((service) => (
            <div
              key={service.title}
              className="bg-[#F5F5F7] rounded-2xl p-5 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${service.iconColor}15` }}
                >
                  <service.icon size={24} style={{ color: service.iconColor }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-bold text-[#1D1D1F] mb-1">
                    {service.title}
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] leading-relaxed mb-3">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-[11px] bg-white px-2 py-1 rounded-full text-[#6E6E73]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Services */}
      <section className="bg-[#F5F5F7] py-10 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-2 block">
          Additional Services
        </span>
        <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-6">
          Complete Support
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {additionalServices.map((service) => (
            <div key={service.title} className="bg-white rounded-2xl p-4 text-center">
              <div className="w-10 h-10 bg-[#007AFF]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <service.icon size={20} className="text-[#007AFF]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[13px] font-semibold text-[#1D1D1F] mb-1">{service.title}</h3>
              <p className="text-[11px] text-[#6E6E73] leading-tight">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-white py-10 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-2 block">
          Our Process
        </span>
        <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-6">
          How It Works
        </h2>

        <div className="flex flex-col gap-4">
          {[
            { step: '01', title: 'Request a Quote', desc: 'Tell us about your shipment' },
            { step: '02', title: 'We Plan', desc: 'Tailored logistics solution' },
            { step: '03', title: 'In Transit', desc: 'Your cargo is on its way' },
            { step: '04', title: 'Delivered', desc: 'On time, every time' }
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4 bg-[#F5F5F7] rounded-2xl p-4">
              <div className="text-[24px] font-bold text-[#007AFF]/20 leading-none w-10">
                {item.step}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#1D1D1F]">{item.title}</h3>
                <p className="text-[12px] text-[#6E6E73]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#007AFF] py-12 px-5">
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-white mb-3">
            Get Your Free Quote
          </h2>
          <p className="text-[14px] text-white/80 mb-6">
            Contact us today and receive a detailed quote within 48 hours.
          </p>
          <Link
            href="/contact/"
            className="inline-flex items-center gap-2 bg-white text-[#007AFF] px-8 py-4 rounded-full text-[15px] font-semibold active:scale-95 transition-transform"
          >
            Request a Quote
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}

// 主页面组件 - 自动检测设备类型
export default function ServicesPage() {
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

  return isMobile ? <MobileServicesPage /> : <DesktopServicesPage />;
}
