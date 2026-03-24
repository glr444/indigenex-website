'use client';

import { useEffect, useState } from 'react';
import { Check, Plus, Minus, ChevronRight, Phone, Mail, MapPin, Clock } from 'lucide-react';

// PC端联系页
function DesktopContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    phone: '',
    email: '',
    inquiryType: 'SHIPPING_QUOTE',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    { q: 'How do I track my shipment?', a: 'You can track your shipment in real time through our online tracking system, or contact our customer service team for the latest updates.' },
    { q: 'What documents are required for international shipping?', a: 'International freight typically requires a commercial invoice, packing list, bill of lading or airway bill, certificate of origin, and any applicable permits or licences.' },
    { q: 'How quickly will I receive a quote?', a: 'We are committed to providing a detailed quote within 48 hours of your enquiry.' },
    { q: 'Do you handle dangerous goods?', a: 'Yes, we are qualified and experienced in handling dangerous goods in full compliance with all safety regulations.' }
  ];

  const inquiryTypes = [
    { value: 'SHIPPING_QUOTE', label: 'Shipping Quote' },
    { value: 'TRACKING', label: 'Shipment Tracking' },
    { value: 'CUSTOM_SOLUTION', label: 'Custom Solution' },
    { value: 'GENERAL', label: 'General Enquiry' },
  ];

  return (
    <>
      {/* Hero - Apple Style */}
      <section className="bg-[#1D1D1F] pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <span className="text-[12px] font-semibold tracking-[0.5px] text-[#86868B] uppercase mb-4 block">
            Contact Us
          </span>
          <h1 className="text-[40px] lg:text-[56px] font-bold text-white mb-4 tracking-[-1px]">
            Get in Touch
          </h1>
          <p className="text-[17px] text-[#86868B]">
            Request a quote or enquire about our logistics services.
          </p>
        </div>
      </section>

      {/* Form Section - Apple Style */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Form */}
            <div className="flex-1">
              <h2 className="text-[28px] font-bold text-[#1D1D1F] mb-8 tracking-[-0.5px]">
                Send a Message
              </h2>

              {submitted ? (
                <div className="bg-[#34C759]/10 rounded-[20px] p-10 text-center">
                  <div className="w-16 h-16 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-white" size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[21px] font-semibold text-[#1D1D1F] mb-2">Message Sent!</h3>
                  <p className="text-[#6E6E73]">We'll get back to you within 48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-[13px] font-semibold text-[#3A3A3C] mb-2 block">
                      Full Name <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full h-12 px-4 bg-[#F5F5F7] rounded-[10px] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[15px]"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#3A3A3C] mb-2 block">
                      Company
                    </label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 bg-[#F5F5F7] rounded-[10px] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[15px]"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-semibold text-[#3A3A3C] mb-2 block">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full h-12 px-4 bg-[#F5F5F7] rounded-[10px] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[15px]"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-semibold text-[#3A3A3C] mb-2 block">
                        Email <span className="text-[#FF3B30]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full h-12 px-4 bg-[#F5F5F7] rounded-[10px] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[15px]"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#3A3A3C] mb-2 block">
                      Enquiry Type
                    </label>
                    <select
                      className="w-full h-12 px-4 bg-[#F5F5F7] rounded-[10px] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[15px] appearance-none cursor-pointer"
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#3A3A3C] mb-2 block">
                      Details
                    </label>
                    <textarea
                      rows={5}
                      className="w-full p-4 bg-[#F5F5F7] rounded-[10px] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[15px] resize-none"
                      value={formData.details}
                      onChange={(e) => setFormData({...formData, details: e.target.value})}
                      placeholder="Describe your requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                  <p className="text-[13px] text-[#86868B]">We'll get back to you within 48 hours.</p>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="lg:w-[340px]">
              <h2 className="text-[28px] font-bold text-[#1D1D1F] mb-8 tracking-[-0.5px]">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="bg-[#F5F5F7] rounded-[16px] p-5">
                  <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wide block mb-1">Email</span>
                  <p className="text-[15px] text-[#1D1D1F]">info@carggo.com</p>
                </div>
                <div className="bg-[#F5F5F7] rounded-[16px] p-5">
                  <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wide block mb-1">Phone</span>
                  <p className="text-[15px] text-[#1D1D1F]">+61 (2) XXXX XXXX</p>
                </div>
                <div className="bg-[#F5F5F7] rounded-[16px] p-5">
                  <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wide block mb-1">Address</span>
                  <p className="text-[15px] text-[#1D1D1F] leading-relaxed">
                    123 Logistics Drive<br />
                    Sydney NSW 2000<br />
                    Australia
                  </p>
                </div>
                <div className="bg-[#F5F5F7] rounded-[16px] p-5">
                  <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wide block mb-1">Business Hours</span>
                  <p className="text-[15px] text-[#1D1D1F]">Mon–Fri, 9:00am–5:00pm AEST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Apple Style */}
      <section className="bg-[#F5F5F7] py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <span className="micro-label mb-4 block text-center">FAQ</span>
          <h2 className="section-title mb-12 text-center">Frequently Asked Questions</h2>

          <div className="max-w-[800px] mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[16px] overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-6 text-left"
                >
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{faq.q}</h3>
                  <div className={`w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                    {openFaq === idx ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6">
                    <p className="text-[15px] text-[#6E6E73] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// 移动端联系页
function MobileContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    phone: '',
    email: '',
    inquiryType: 'SHIPPING_QUOTE',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    { q: 'How do I track my shipment?', a: 'You can track your shipment in real time through our online tracking system.' },
    { q: 'What documents are required?', a: 'Commercial invoice, packing list, bill of lading, and certificate of origin.' },
    { q: 'How quickly will I receive a quote?', a: 'We provide a detailed quote within 48 hours.' },
    { q: 'Do you handle dangerous goods?', a: 'Yes, we are qualified to handle dangerous goods safely.' }
  ];

  const inquiryTypes = [
    { value: 'SHIPPING_QUOTE', label: 'Shipping Quote' },
    { value: 'TRACKING', label: 'Tracking' },
    { value: 'CUSTOM_SOLUTION', label: 'Custom' },
    { value: 'GENERAL', label: 'General' },
  ];

  return (
    <div className="mobile-contact">
      {/* Hero */}
      <section className="bg-[#1D1D1F] pt-24 pb-10 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#86868B] mb-3 block">
          Contact Us
        </span>
        <h1 className="text-[28px] font-bold text-white mb-3 tracking-[-0.5px]">
          Get in Touch
        </h1>
        <p className="text-[14px] text-[#86868B]">
          Request a quote or enquire about our services.
        </p>
      </section>

      {/* Quick Contact Info */}
      <section className="bg-white py-6 px-5 -mt-2 rounded-t-3xl relative z-10">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a href="tel:+61200000000" className="bg-[#F5F5F7] rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
              <Phone size={18} className="text-[#007AFF]" />
            </div>
            <div>
              <div className="text-[11px] text-[#86868B]">Call</div>
              <div className="text-[13px] font-semibold text-[#1D1D1F]">+61 2 XXXX</div>
            </div>
          </a>
          <a href="mailto:info@carggo.com" className="bg-[#F5F5F7] rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
              <Mail size={18} className="text-[#007AFF]" />
            </div>
            <div>
              <div className="text-[11px] text-[#86868B]">Email</div>
              <div className="text-[13px] font-semibold text-[#1D1D1F]">info@...</div>
            </div>
          </a>
        </div>

        {/* Form */}
        <h2 className="text-[20px] font-bold text-[#1D1D1F] mb-4">Send a Message</h2>

        {submitted ? (
          <div className="bg-[#34C759]/10 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1D1D1F] mb-1">Message Sent!</h3>
            <p className="text-[13px] text-[#6E6E73]">We'll get back to you within 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-semibold text-[#3A3A3C] mb-1.5 block">
                Full Name <span className="text-[#FF3B30]">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full h-12 px-4 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[14px]"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3A3A3C] mb-1.5 block">
                Email <span className="text-[#FF3B30]">*</span>
              </label>
              <input
                type="email"
                required
                className="w-full h-12 px-4 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[14px]"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="your@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-[#3A3A3C] mb-1.5 block">Phone</label>
                <input
                  type="tel"
                  className="w-full h-12 px-4 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[14px]"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Phone"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#3A3A3C] mb-1.5 block">Company</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[14px]"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Company"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3A3A3C] mb-1.5 block">Enquiry Type</label>
              <select
                className="w-full h-12 px-4 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[14px] appearance-none"
                value={formData.inquiryType}
                onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
              >
                {inquiryTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3A3A3C] mb-1.5 block">Details</label>
              <textarea
                rows={4}
                className="w-full p-4 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none transition-all text-[14px] resize-none"
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
                placeholder="Tell us about your needs..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#007AFF] text-white h-12 rounded-xl text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'Sending...' : 'Send Message'}
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </form>
        )}
      </section>

      {/* Address & Hours */}
      <section className="bg-[#F5F5F7] py-8 px-5">
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 flex items-start gap-3">
            <MapPin size={18} className="text-[#007AFF] mt-0.5" />
            <div>
              <div className="text-[12px] text-[#86868B] mb-0.5">Address</div>
              <div className="text-[14px] text-[#1D1D1F]">123 Logistics Drive, Sydney NSW 2000</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-start gap-3">
            <Clock size={18} className="text-[#007AFF] mt-0.5" />
            <div>
              <div className="text-[12px] text-[#86868B] mb-0.5">Business Hours</div>
              <div className="text-[14px] text-[#1D1D1F]">Mon–Fri, 9:00am–5:00pm</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-10 px-5">
        <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#007AFF] mb-2 block text-center">FAQ</span>
        <h2 className="text-[20px] font-bold text-[#1D1D1F] mb-6 text-center">Common Questions</h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#F5F5F7] rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <h3 className="text-[14px] font-semibold text-[#1D1D1F] pr-4">{faq.q}</h3>
                <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                  {openFaq === idx ? <Minus size={12} /> : <Plus size={12} />}
                </div>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4">
                  <p className="text-[13px] text-[#6E6E73] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// 主页面组件 - 自动检测设备类型
export default function ContactPage() {
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

  return isMobile ? <MobileContactPage /> : <DesktopContactPage />;
}
