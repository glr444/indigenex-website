'use client';

import Link from 'next/link';
import { Ship, Mail, Phone, MapPin } from 'lucide-react';
import TechWaveBackground from './TechWaveBackground';

export default function TechFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative min-h-[400px] overflow-hidden">
      {/* Tech Wave Background */}
      <TechWaveBackground />

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end">
        {/* Main Footer Content */}
        <div className="px-6 lg:px-12 py-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <Ship className="w-5 h-5 text-[#00e6ff]" />
                  </div>
                  <span className="text-white text-lg font-semibold tracking-tight">
                    Cargo GM
                  </span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Bridging tradition and modern logistics since 1974. Your trusted partner for global shipping solutions.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
                <ul className="space-y-3">
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'About Us', href: '/about/' },
                    { label: 'Services', href: '/services/' },
                    { label: 'Countries', href: '/countries/' },
                    { label: 'Contact', href: '/contact/' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-white/60 hover:text-[#00e6ff] transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h3>
                <ul className="space-y-3">
                  {[
                    'Air Freight',
                    'Ocean Freight',
                    'Road Freight',
                    'Rail Shipments',
                    'Customs Clearance',
                  ].map((service) => (
                    <li key={service}>
                      <Link
                        href="/services/"
                        className="text-white/60 hover:text-[#00e6ff] transition-colors duration-200 text-sm"
                      >
                        {service}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#00e6ff] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60 text-sm">info@carggo.com</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#00e6ff] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60 text-sm">+61 2 1234 5678</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#00e6ff] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60 text-sm">Sydney, Australia</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 px-6 lg:px-12 py-6">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-xs">
              &copy; {currentYear} Cargo GM. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy/" className="text-white/40 hover:text-white/60 text-xs transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms/" className="text-white/40 hover:text-white/60 text-xs transition-colors">
                Terms of Service
              </Link>
              <Link href="/portal/login" className="text-white/40 hover:text-[#00e6ff] text-xs transition-colors">
                Member Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
