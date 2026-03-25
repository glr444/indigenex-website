import Link from 'next/link';
import { ArrowUpRight, Globe, MapPin, CheckCircle } from 'lucide-react';
import TechFooter from '../components/TechFooter';

export default function CountriesPage() {
  const regions = [
    {
      name: 'Asia Pacific',
      countries: ['Australia', 'China', 'Japan', 'Singapore', 'South Korea', 'Thailand', 'Vietnam', 'Malaysia', 'Indonesia', 'Philippines', 'New Zealand', 'Taiwan'],
      hubs: ['Sydney', 'Melbourne', 'Shanghai', 'Singapore', 'Hong Kong']
    },
    {
      name: 'North America',
      countries: ['United States', 'Canada', 'Mexico'],
      hubs: ['Los Angeles', 'New York', 'Vancouver', 'Toronto', 'Mexico City']
    },
    {
      name: 'Europe',
      countries: ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Italy', 'Spain', 'Belgium', 'Poland', 'Switzerland', 'Austria', 'Sweden', 'Denmark'],
      hubs: ['London', 'Rotterdam', 'Hamburg', 'Antwerp', 'Milan']
    },
    {
      name: 'Middle East & Africa',
      countries: ['UAE', 'Saudi Arabia', 'Qatar', 'South Africa', 'Egypt', 'Israel', 'Turkey', 'Kenya', 'Nigeria'],
      hubs: ['Dubai', 'Jeddah', 'Cape Town', 'Istanbul', 'Tel Aviv']
    },
    {
      name: 'South America',
      countries: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Uruguay'],
      hubs: ['São Paulo', 'Buenos Aires', 'Santiago', 'Lima', 'Bogotá']
    }
  ];

  return (
    <>
      {/* Hero - Apple Style */}
      <section className="bg-[#1D1D1F] pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <span className="text-[12px] font-semibold tracking-[0.5px] text-[#86868B] uppercase mb-4 block">
            Global Coverage
          </span>
          <h1 className="text-[40px] lg:text-[56px] font-bold text-white mb-6 max-w-3xl tracking-[-1px] leading-tight">
            200+ Countries Served
          </h1>
          <p className="text-[17px] text-[#86868B] max-w-2xl">
            From major commercial hubs to remote destinations, we connect your business to the world with reliable logistics solutions.
          </p>
        </div>
      </section>

      {/* Stats Banner - Apple Style */}
      <section className="bg-[#007AFF] py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '200+', label: 'Countries' },
              { value: '500+', label: 'Airports' },
              { value: '300+', label: 'Seaports' },
              { value: '50+', label: 'Hubs' }
            ].map((stat, index) => (
              <div key={stat.label} className={`text-center ${index < 3 ? 'lg:border-r lg:border-white/20' : ''}`}>
                <div className="text-[36px] lg:text-[48px] font-bold text-white tracking-[-1px] mb-1">{stat.value}</div>
                <div className="text-white/80 text-[12px] font-semibold uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions - Apple Style Cards */}
      <section className="bg-[#F5F5F7] py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="micro-label mb-4 block">Service Regions</span>
            <h2 className="section-title">Global Network Coverage</h2>
          </div>

          <div className="space-y-6">
            {regions.map((region) => (
              <div key={region.name} className="bg-white rounded-[20px] p-8 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="lg:w-[240px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#007AFF]/10 rounded-[12px] flex items-center justify-center">
                        <Globe size={20} className="text-[#007AFF]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-[21px] font-semibold text-[#1D1D1F]">{region.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[#6E6E73] text-[13px]">
                      <MapPin size={14} />
                      <span>Key Hubs: {region.hubs.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {region.countries.map((country) => (
                        <span
                          key={country}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] rounded-full text-[14px] text-[#1D1D1F]"
                        >
                          <CheckCircle size={14} className="text-[#34C759]" />
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Apple Style */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="micro-label mb-4 block">Capabilities</span>
            <h2 className="section-title">Global Service Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Door-to-Door',
                desc: 'Complete pickup and delivery service to any destination'
              },
              {
                title: 'Customs Expertise',
                desc: 'Global regulations and documentation handled end-to-end'
              },
              {
                title: 'Real-Time Tracking',
                desc: '24/7 shipment monitoring from anywhere in the world'
              },
              {
                title: 'Multimodal',
                desc: 'Seamless integration of air, ocean, road, and rail'
              },
              {
                title: 'Dangerous Goods',
                desc: 'Certified handling of hazardous materials globally'
              },
              {
                title: 'Temperature Control',
                desc: 'Cold chain solutions for sensitive cargo'
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-[#F5F5F7] rounded-[16px] p-6">
                <h3 className="text-[17px] font-semibold text-[#1D1D1F] mb-2">{feature.title}</h3>
                <p className="text-[14px] text-[#6E6E73]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Apple Style */}
      <section className="bg-[#1D1D1F] py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#007AFF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <span className="text-[12px] font-semibold tracking-[0.5px] text-[#86868B] uppercase mb-4 block">
            Ship Anywhere
          </span>
          <h2 className="text-[36px] lg:text-[48px] font-bold text-white mb-6 tracking-[-0.5px]">
            Need a Custom Route?
          </h2>
          <p className="text-[17px] text-[#86868B] mb-10 max-w-xl mx-auto">
            Contact us for shipping solutions to any destination worldwide.
          </p>
          <Link href="/contact/" className="inline-flex items-center gap-2 bg-white text-[#1D1D1F] px-8 py-4 rounded-full text-[16px] font-semibold hover:bg-[#F5F5F7] transition-all duration-200">
            Get a Quote
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* Tech Footer with Animated Wave Background */}
      <TechFooter />
    </>
  );
}
