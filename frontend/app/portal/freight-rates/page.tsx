'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Search,
  Ship,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calendar,
  Clock,
  AlertCircle,
  Check,
  Phone,
  X,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface FreightRate {
  id: string;
  route: string | null;
  originPort: string;
  originPortEn: string | null;
  destinationPort: string;
  destinationPortEn: string | null;
  viaPort: string | null;
  viaPortEn: string | null;
  transportMode: string;
  carrier: string | null;
  price20GP: number | null;
  price40GP: number | null;
  price40HQ: number | null;
  price45HQ: number | null;
  priceLCL: number | null;
  currency: string;
  transitTime: number | null;
  schedule: string | null;
  spaceStatus: string | null;
  validFrom: string;
  validTo: string;
  cutOffDate: string | null;
  estimatedDeparture: string | null;
  surcharges: { name: string; amount: number; unit: string }[];
  remarks: string | null;
}

interface Port {
  id: string;
  code: string;
  nameEn: string;
  nameCn: string;
  countryCode: string;
  countryName: string;
  region: string;
}

interface MemberProfile {
  salesName?: string;
  salesPhone?: string;
  salesMobile?: string;
  salesEmail?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Space status mapping
const spaceStatusMap: Record<string, { text: string; color: string; bgColor: string }> = {
  'AVAILABLE': { text: 'Available', color: '#34C759', bgColor: '#E8F5E9' },
  'LIMITED': { text: 'Limited', color: '#FF9500', bgColor: '#FFF3E0' },
  'FULL': { text: 'Full', color: '#FF3B30', bgColor: '#FFEBEE' },
};

// Port Selector Component
function PortSelector({
  value,
  onChange,
  placeholder,
  type = 'ORIGIN',
  label
}: {
  value: string;
  onChange: (value: string, port?: Port) => void;
  placeholder: string;
  type: 'ORIGIN' | 'DESTINATION';
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [ports, setPorts] = useState<Port[]>([]);
  const [preferredPorts, setPreferredPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPorts = async (searchTerm = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('memberToken');
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      if (searchTerm) {
        const response = await fetch(
          `http://localhost:5001/api/ports/search?q=${encodeURIComponent(searchTerm)}&limit=20`,
          { headers }
        );
        const data = await response.json();
        if (data.success) {
          setPorts(data.data.ports);
          setPreferredPorts([]);
        }
      } else {
        const response = await fetch(
          `http://localhost:5001/api/ports/popular?type=${type}`,
          { headers }
        );
        const data = await response.json();
        if (data.success) {
          setPorts(data.data.all);
          setPreferredPorts(data.data.preferred || []);
        }
      }
    } catch (err) {
      console.error('Fetch ports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordPreference = async (portCode: string) => {
    const token = localStorage.getItem('memberToken');
    if (!token) return;

    try {
      await fetch(`http://localhost:5001/api/ports/${portCode}/preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      console.error('Record preference error:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPorts(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      fetchPorts(search);
    }
  }, [isOpen]);

  const handleSelect = (port: Port) => {
    onChange(port.nameEn, port);
    recordPreference(port.code);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', undefined);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!value) return '';
    const port = ports.find(p => p.nameEn === value || p.nameCn === value);
    if (port) return `${port.nameEn} (${port.nameCn})`;
    return value;
  };

  const groupedPorts = ports.reduce((acc, port) => {
    const region = port.region || 'Others';
    if (!acc[region]) acc[region] = [];
    acc[region].push(port);
    return acc;
  }, {} as Record<string, Port[]>);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#3A3A3C', marginBottom: 8 }}>
        {label}
      </label>
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 12,
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#F5F5F7',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 14,
          color: value ? '#1D1D1F' : '#86868B',
        }}
      >
        <span onClick={() => setIsOpen(!isOpen)} style={{ flex: 1 }}>
          {value ? getDisplayText() : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {value && (
            <button
              onClick={handleClear}
              style={{
                padding: '2px',
                border: 'none',
                background: '#E5E5EA',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={12} style={{ color: '#86868B' }} />
            </button>
          )}
          <ChevronDown size={16} style={{ color: '#86868B' }} onClick={() => setIsOpen(!isOpen)} />
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)',
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <div style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={16} style={{ color: '#86868B' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search port..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  background: 'transparent',
                }}
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ padding: 2 }}>
                  <X size={14} style={{ color: '#86868B' }} />
                </button>
              )}
            </div>
          </div>

          {preferredPorts.length > 0 && !search && (
            <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '4px 12px', fontSize: 12, color: '#86868B', fontWeight: 500 }}>Frequently Used</div>
              {preferredPorts.map((port) => (
                <div
                  key={port.id}
                  onClick={() => handleSelect(port)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#1D1D1F',
                    background: value === port.nameEn ? 'rgba(0,122,255,0.08)' : 'transparent',
                  }}
                >
                  {port.nameEn} ({port.nameCn})
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#86868B', fontSize: 14 }}>
              Loading...
            </div>
          ) : (
            Object.entries(groupedPorts).map(([region, regionPorts]) => (
              <div key={region} style={{ padding: '8px 0' }}>
                <div style={{ padding: '4px 12px', fontSize: 12, color: '#86868B', fontWeight: 500 }}>{region}</div>
                {regionPorts.map((port) => (
                  <div
                    key={port.id}
                    onClick={() => handleSelect(port)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: '#1D1D1F',
                      background: value === port.nameEn ? 'rgba(0,122,255,0.08)' : 'transparent',
                    }}
                  >
                    {port.nameEn} ({port.nameCn})
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Inquiry Modal Component
function InquiryModal({
  rate,
  memberProfile,
  onClose
}: {
  rate: FreightRate;
  memberProfile: MemberProfile | null;
  onClose: () => void;
}) {
  const originPort = rate.originPortEn || rate.originPort;
  const destPort = rate.destinationPortEn || rate.destinationPort;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          width: '90%',
          maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>Contact Sales</h3>
          <button onClick={onClose} style={{ padding: 4 }}>
            <X size={20} style={{ color: '#86868B' }} />
          </button>
        </div>

        <div style={{ marginBottom: 20, padding: 16, background: '#F5F5F7', borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#86868B', marginBottom: 8 }}>Route</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#1D1D1F' }}>
            {originPort} → {destPort}
          </div>
          <div style={{ fontSize: 14, color: '#86868B', marginTop: 4 }}>
            {rate.carrier} | 20GP: {rate.price20GP || '-'} {rate.currency}
          </div>
        </div>

        {memberProfile?.salesName ? (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: '#86868B', marginBottom: 12 }}>Your Dedicated Sales</div>
            <div
              style={{
                padding: 16,
                border: '1px solid rgba(0,122,255,0.3)',
                borderRadius: 12,
                background: 'rgba(0,122,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: '#007AFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={24} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#1D1D1F' }}>
                    {memberProfile.salesName}
                  </div>
                  <div style={{ fontSize: 14, color: '#86868B' }}>Account Manager</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {memberProfile.salesPhone && (
                  <a href={`tel:${memberProfile.salesPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff', borderRadius: 8, fontSize: 14, color: '#1D1D1F', textDecoration: 'none' }}>
                    <Phone size={16} style={{ color: '#007AFF' }} />
                    Tel: {memberProfile.salesPhone}
                  </a>
                )}
                {memberProfile.salesMobile && (
                  <a href={`tel:${memberProfile.salesMobile}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff', borderRadius: 8, fontSize: 14, color: '#1D1D1F', textDecoration: 'none' }}>
                    <Phone size={16} style={{ color: '#007AFF' }} />
                    Mobile: {memberProfile.salesMobile}
                  </a>
                )}
                {memberProfile.salesEmail && (
                  <a href={`mailto:${memberProfile.salesEmail}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff', borderRadius: 8, fontSize: 14, color: '#1D1D1F', textDecoration: 'none' }}>
                    <span style={{ color: '#007AFF', fontSize: 16 }}>@</span>
                    Email: {memberProfile.salesEmail}
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <div style={{ padding: 16, background: '#FFF3E0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={24} style={{ color: '#FF9500' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>No dedicated sales assigned</div>
                <div style={{ fontSize: 13, color: '#86868B' }}>Please contact customer service</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: '#007AFF',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({
  pagination,
  onPageChange
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages } = pagination;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#fff',
          color: page === 1 ? '#C7C7CC' : '#3A3A3C',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <ChevronLeft size={16} />
        Prev
      </button>

      {getPageNumbers().map((p, idx) => (
        <button
          key={idx}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          disabled={p === '...'}
          style={{
            minWidth: 36,
            height: 36,
            padding: '0 12px',
            borderRadius: 8,
            border: 'none',
            background: p === page ? '#007AFF' : '#fff',
            color: p === page ? '#fff' : p === '...' ? '#86868B' : '#3A3A3C',
            fontSize: 14,
            fontWeight: 500,
            cursor: p === '...' ? 'default' : 'pointer',
            boxShadow: p === page ? '0 2px 8px rgba(0,122,255,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#fff',
          color: page === totalPages ? '#C7C7CC' : '#3A3A3C',
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function FreightRatesPage() {
  const [rates, setRates] = useState<FreightRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    originPort: '',
    originPortCode: '',
    destinationPort: '',
    destinationPortCode: '',
    carrier: '',
    directOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRate, setExpandedRate] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'transitTime' | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [inquiryRate, setInquiryRate] = useState<FreightRate | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('memberToken');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5001/api/member/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data?.member) {
          setMemberProfile({
            salesName: data.data.member.salesName,
            salesPhone: data.data.member.salesPhone,
            salesMobile: data.data.member.salesMobile,
            salesEmail: data.data.member.salesEmail,
          });
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    fetchRates();
  }, [pagination.page]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('memberToken');

      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (filters.originPortCode) params.append('originPortCode', filters.originPortCode);
      if (filters.destinationPortCode) params.append('destinationPortCode', filters.destinationPortCode);
      if (filters.carrier) params.append('carrier', filters.carrier);

      const response = await fetch(
        `http://localhost:5001/api/freight-rates/public?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();

      if (data.success) {
        setRates(data.data.rates || []);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || 'Failed to fetch rates');
      }
    } catch (err) {
      setError('Network error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRates();
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null || price === undefined) return '-';
    return `${currency}${price}`;
  };

  const getSpaceStatus = (status: string | null) => {
    return spaceStatusMap[status || 'AVAILABLE'] || spaceStatusMap['AVAILABLE'];
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWeekday = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays[date.getDay()];
  };

  const filteredRates = rates.filter(rate => {
    if (filters.directOnly && rate.viaPort) return false;
    return true;
  });

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px 24px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.3px', marginBottom: 8 }}>
          Freight Rate Search
        </h1>
        <p style={{ color: '#86868B', fontSize: 15 }}>
          Search global ocean freight rates with real-time space availability
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: '#86868B' }} />
            <input
              type="text"
              placeholder="Search port, route, carrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 15,
                background: '#F5F5F7',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#007AFF'; e.target.style.background = '#fff'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.background = '#F5F5F7'; }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.08)', background: showFilters ? 'rgba(0,122,255,0.08)' : '#fff',
              color: showFilters ? '#007AFF' : '#3A3A3C', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <Filter size={18} />
            Filter
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={handleSearch}
            style={{
              padding: '12px 28px', borderRadius: 12, fontWeight: 500, fontSize: 15,
              color: '#fff', background: '#007AFF', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Search
          </button>
        </div>

        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <PortSelector
              label="Origin Port"
              type="ORIGIN"
              value={filters.originPort}
              onChange={(value, port) => setFilters(prev => ({
                ...prev,
                originPort: value,
                originPortCode: port?.code || ''
              }))}
              placeholder="Select origin port"
            />
            <PortSelector
              label="Destination Port"
              type="DESTINATION"
              value={filters.destinationPort}
              onChange={(value, port) => setFilters(prev => ({
                ...prev,
                destinationPort: value,
                destinationPortCode: port?.code || ''
              }))}
              placeholder="Select destination port"
            />
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#3A3A3C', marginBottom: 8 }}>
                Carrier
              </label>
              <select
                value={filters.carrier}
                onChange={(e) => setFilters(prev => ({ ...prev, carrier: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 14, background: '#F5F5F7', outline: 'none' }}
              >
                <option value="">All Carriers</option>
                <option value="CMA CGM">CMA CGM</option>
                <option value="COSCO">COSCO</option>
                <option value="MSC">MSC</option>
                <option value="MAERSK">MAERSK</option>
                <option value="ONE">ONE</option>
                <option value="EVERGREEN">EVERGREEN</option>
                <option value="HAPAG-LLOYD">HAPAG-LLOYD</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setFilters(prev => ({ ...prev, directOnly: !prev.directOnly }))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 12,
                  border: filters.directOnly ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.08)',
                  background: filters.directOnly ? '#007AFF' : '#fff',
                  color: filters.directOnly ? '#fff' : '#3A3A3C',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 16, height: 16, borderRadius: 4, background: filters.directOnly ? '#fff' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {filters.directOnly && <Check size={12} style={{ color: '#007AFF' }} />}
                </div>
                Direct Only
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <span style={{ color: '#86868B', fontSize: 14 }}>Sort by:</span>
        <button
          onClick={() => setSortBy(sortBy === 'price' ? null : 'price')}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
            fontSize: 14, background: sortBy === 'price' ? 'rgba(0,122,255,0.08)' : 'transparent',
            color: sortBy === 'price' ? '#007AFF' : '#3A3A3C', border: 'none', cursor: 'pointer',
          }}
        >
          Price
          <ChevronDown size={14} />
        </button>
        <button
          onClick={() => setSortBy(sortBy === 'transitTime' ? null : 'transitTime')}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
            fontSize: 14, background: sortBy === 'transitTime' ? 'rgba(0,122,255,0.08)' : 'transparent',
            color: sortBy === 'transitTime' ? '#007AFF' : '#3A3A3C', border: 'none', cursor: 'pointer',
          }}
        >
          Transit Time
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: 12, color: '#86868B', fontSize: 14 }}>
        Showing {filteredRates.length} of {pagination.total} results
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ borderRadius: 16, padding: 48, textAlign: 'center', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 32, height: 32, border: '2px solid #E5E5EA', borderTopColor: '#007AFF', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#86868B', fontSize: 14 }}>Loading...</p>
          </div>
        ) : filteredRates.length === 0 ? (
          <div style={{ borderRadius: 16, padding: 48, textAlign: 'center', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Ship size={48} style={{ color: '#C7C7CC', margin: '0 auto 16px' }} />
            <p style={{ color: '#86868B', fontSize: 16 }}>No freight rates found</p>
            <p style={{ color: '#C7C7CC', fontSize: 14, marginTop: 8 }}>Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredRates.map((rate) => {
            const isExpanded = expandedRate === rate.id;
            const spaceStatus = getSpaceStatus(rate.spaceStatus);
            const originPort = rate.originPortEn || rate.originPort;
            const destPort = rate.destinationPortEn || rate.destinationPort;
            const viaPort = rate.viaPortEn || rate.viaPort;

            return (
              <div key={rate.id} style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: 16 }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: 12,
                    alignItems: 'center',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rate.carrier || '-'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: !viaPort ? '#007AFF' : '#E5E5EA' }}>
                        {!viaPort && <Check size={12} style={{ color: '#fff' }} />}
                      </div>
                      <span style={{ color: '#86868B', fontSize: 12 }}>
                        {!viaPort ? 'Direct' : 'Transship'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>{originPort}</span>
                        <ArrowRight size={14} style={{ color: '#C7C7CC' }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>{destPort}</span>
                      </div>
                      {viaPort && <div style={{ color: '#86868B', fontSize: 11, marginTop: 2 }}>via {viaPort}</div>}
                      {rate.transitTime && <div style={{ color: '#86868B', fontSize: 12, marginTop: 2 }}>{rate.transitTime} days</div>}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: spaceStatus.bgColor, color: spaceStatus.color }}>
                        {spaceStatus.text}
                      </span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#FF3B30' }}>{formatPrice(rate.price20GP, rate.currency)}</div>
                      <div style={{ color: '#86868B', fontSize: 11 }}>20GP</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#FF3B30' }}>{formatPrice(rate.price40GP, rate.currency)}</div>
                      <div style={{ color: '#86868B', fontSize: 11 }}>40GP</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#FF3B30' }}>{formatPrice(rate.price40HQ, rate.currency)}</div>
                      <div style={{ color: '#86868B', fontSize: 11 }}>40HQ</div>
                    </div>

                    <div style={{ textAlign: 'center', minWidth: 100 }}>
                      <div style={{ color: '#1D1D1F', fontSize: 13 }}>{formatDate(rate.cutOffDate)} / {getWeekday(rate.estimatedDeparture)}</div>
                      <div style={{ color: '#86868B', fontSize: 11 }}>Cut-off/ETD</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <button
                        onClick={() => setExpandedRate(isExpanded ? null : rate.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, fontSize: 12, border: '1px solid rgba(0,0,0,0.08)', color: '#3A3A3C', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Details
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      <button
                        onClick={() => setInquiryRate(rate)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, fontSize: 12, color: '#fff', background: '#007AFF', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        <Phone size={12} />
                        Inquiry
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    {rate.transitTime && rate.transitTime > 0 && (
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#F5F5F7', color: '#86868B' }}>Weight Limit</span>
                    )}
                    {rate.surcharges && rate.surcharges.length > 0 && (
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#F5F5F7', color: '#86868B' }}>Surcharges</span>
                    )}
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#F5F5F7', color: '#86868B' }}>MBL/HBL</span>
                    {rate.route && (
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#F5F5F7', color: '#86868B' }}>Service: {rate.route}</span>
                    )}
                    {rate.remarks && (
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#FFF3E0', color: '#FF9500' }}>Note</span>
                    )}
                    <div style={{ flex: 1 }} />
                    <div style={{ color: '#86868B', fontSize: 12 }}>
                      Valid: {formatDate(rate.validFrom)} - {formatDate(rate.validTo)}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1D1D1F' }}>Full Price List</h4>
                        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#F5F5F7' }}>
                          <table style={{ width: '100%', fontSize: 14 }}>
                            <tbody>
                              {rate.price20GP && (
                                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                  <td style={{ padding: '8px 16px', color: '#86868B' }}>20GP</td>
                                  <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 500, color: '#FF3B30' }}>{formatPrice(rate.price20GP, rate.currency)}</td>
                                </tr>
                              )}
                              {rate.price40GP && (
                                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                  <td style={{ padding: '8px 16px', color: '#86868B' }}>40GP</td>
                                  <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 500, color: '#FF3B30' }}>{formatPrice(rate.price40GP, rate.currency)}</td>
                                </tr>
                              )}
                              {rate.price40HQ && (
                                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                  <td style={{ padding: '8px 16px', color: '#86868B' }}>40HQ</td>
                                  <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 500, color: '#FF3B30' }}>{formatPrice(rate.price40HQ, rate.currency)}</td>
                                </tr>
                              )}
                              {rate.price45HQ && (
                                <tr>
                                  <td style={{ padding: '8px 16px', color: '#86868B' }}>45HQ</td>
                                  <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 500, color: '#FF3B30' }}>{formatPrice(rate.price45HQ, rate.currency)}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1D1D1F' }}>Surcharges</h4>
                        {rate.surcharges && rate.surcharges.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {rate.surcharges.map((surcharge, index) => (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: '#F5F5F7' }}>
                                <span style={{ color: '#86868B', fontSize: 13 }}>{surcharge.name}</span>
                                <span style={{ color: '#1D1D1F', fontSize: 13 }}>{surcharge.amount} {rate.currency}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: '#86868B', fontSize: 13 }}>No surcharges</div>
                        )}
                      </div>

                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1D1D1F' }}>Validity & Schedule</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, background: '#F5F5F7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Calendar size={16} style={{ color: '#86868B' }} />
                              <span style={{ color: '#86868B', fontSize: 13 }}>Validity</span>
                            </div>
                            <span style={{ color: '#1D1D1F', fontSize: 13 }}>{formatDate(rate.validFrom)} ~ {formatDate(rate.validTo)}</span>
                          </div>
                          {rate.schedule && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, background: '#F5F5F7' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Clock size={16} style={{ color: '#86868B' }} />
                                <span style={{ color: '#86868B', fontSize: 13 }}>Schedule</span>
                              </div>
                              <span style={{ color: '#1D1D1F', fontSize: 13 }}>{rate.schedule}</span>
                            </div>
                          )}
                          {rate.cutOffDate && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, background: '#F5F5F7' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircle size={16} style={{ color: '#FF9500' }} />
                                <span style={{ color: '#86868B', fontSize: 13 }}>Cut-off</span>
                              </div>
                              <span style={{ color: '#FF3B30', fontSize: 13 }}>{formatDate(rate.cutOffDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {rate.remarks && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1D1D1F' }}>Remarks</h4>
                          <p style={{ fontSize: 14, borderRadius: 12, padding: 16, color: '#3A3A3C', background: '#F5F5F7' }}>{rate.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={handlePageChange} />

      {/* Inquiry Modal */}
      {inquiryRate && (
        <InquiryModal rate={inquiryRate} memberProfile={memberProfile} onClose={() => setInquiryRate(null)} />
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
