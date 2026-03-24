import Link from 'next/link';

export default function Footer() {
  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about/' },
    { label: 'Services', href: '/services/' },
    { label: 'Countries', href: '/countries/' },
    { label: 'Contact', href: '/contact/' },
  ];

  return (
    <footer className="bg-[#1D1D1F]">
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-[18px] font-bold text-white mb-4">
              Carggo GM
            </h3>
            <p className="text-[14px] text-white/60 leading-relaxed max-w-xs">
              Indigenous-owned freight and logistics company delivering reliable solutions across air, ocean, road, and rail.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[12px] font-semibold text-white/40 uppercase tracking-wide mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[12px] font-semibold text-white/40 uppercase tracking-wide mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-[14px] text-white/70">
              <li>info@carggo.com</li>
              <li>+61 (2) XXXX XXXX</li>
              <li>Mon–Fri, 9am–5pm AEST</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-white/40">
            <p>© 2026 Carggo GM. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
              <span className="hover:text-white cursor-pointer transition-colors">Facebook</span>
              <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
