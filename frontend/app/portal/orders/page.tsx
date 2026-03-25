'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Package,
  Calendar,
  MapPin,
  Ship,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

interface Order {
  id: string;
  orderNo: string;
  blNo?: string;
  status: string;
  pol: string;
  pod: string;
  carrier?: string;
  containerType?: string;
  etd?: string;
  eta?: string;
  createdAt: string;
  updatedAt: string;
  tracking?: TrackingNode[];
}

interface TrackingNode {
  time: string;
  location: string;
  status: string;
  description?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('memberToken');

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      if (searchTerm) params.append('search', searchTerm);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(
        `/api/orders?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders || []);
        setTotalPages(Math.ceil((data.data.total || 0) / 20));
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'BOOKED': '#007AFF',
      'PROCESSING': '#FF9500',
      'IN_TRANSIT': '#5856D6',
      'ARRIVED': '#34C759',
      'DELIVERED': '#34C759',
      'COMPLETED': '#34C759',
      'CANCELLED': '#FF3B30',
    };
    return colors[status] || '#86868B';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'BOOKED': 'Booked',
      'PROCESSING': 'Processing',
      'IN_TRANSIT': 'In Transit',
      'ARRIVED': 'Arrived',
      'DELIVERED': 'Delivered',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'PENDING': 'Pending',
    };
    return texts[status] || status;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: '#1D1D1F', letterSpacing: '-0.3px' }}
        >
          Order Inquiry
        </h1>
        <p style={{ color: '#86868B', fontSize: 15 }}>
          View your shipping orders and logistics tracking
        </p>
      </div>

      {/* Search and Filter */}
      <div
        className="rounded-2xl p-4 mb-6"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: '#86868B' }}
            />
            <input
              type="text"
              placeholder="Search by order number, B/L number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all duration-200"
              style={{
                borderColor: 'rgba(0,0,0,0.08)',
                fontSize: 15,
                background: '#F5F5F7',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007AFF';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                e.target.style.background = '#F5F5F7';
              }}
            />
          </div>
          <div className="flex gap-3">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="px-4 py-3 rounded-xl border outline-none"
              style={{
                borderColor: 'rgba(0,0,0,0.08)',
                fontSize: 14,
                background: '#F5F5F7',
              }}
            />
            <span className="self-center" style={{ color: '#86868B' }}>
              to
            </span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="px-4 py-3 rounded-xl border outline-none"
              style={{
                borderColor: 'rgba(0,0,0,0.08)',
                fontSize: 14,
                background: '#F5F5F7',
              }}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200"
              style={{ background: '#007AFF', fontSize: 15 }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ background: '#FFE5E5' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FF3B30' }} />
          <span style={{ color: '#FF3B30', fontSize: 14 }}>{error}</span>
        </div>
      )}

      {/* Order List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {loading ? (
          <div className="p-12 text-center">
            <div
              className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"
            />
            <p style={{ color: '#86868B', fontSize: 14 }}>Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package
              size={48}
              style={{ color: '#C7C7CC', margin: '0 auto 16px' }}
            />
            <p style={{ color: '#86868B', fontSize: 16 }}>No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F5F5F7' }}>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#86868B' }}
                    >
                      Order Info
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#86868B' }}
                    >
                      Route
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#86868B' }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#86868B' }}
                    >
                      Estimated Time
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#86868B' }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div
                          className="font-medium text-sm"
                          style={{ color: '#1D1D1F' }}
                        >
                          {order.orderNo}
                        </div>
                        {order.blNo && (
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: '#86868B' }}
                          >
                            B/L: {order.blNo}
                          </div>
                        )}
                        {order.containerType && (
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: '#86868B' }}
                          >
                            {order.containerType}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} style={{ color: '#007AFF' }} />
                          <span style={{ color: '#1D1D1F' }}>{order.pol}</span>
                          <span style={{ color: '#C7C7CC' }}>→</span>
                          <MapPin size={14} style={{ color: '#34C759' }} />
                          <span style={{ color: '#1D1D1F' }}>{order.pod}</span>
                        </div>
                        {order.carrier && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: '#86868B' }}
                          >
                            {order.carrier}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: `${getStatusColor(order.status)}15`,
                            color: getStatusColor(order.status),
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: getStatusColor(order.status) }}
                          />
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: '#1D1D1F' }}>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} style={{ color: '#86868B' }} />
                            ETD: {formatDate(order.etd || order.createdAt)}
                          </div>
                          {order.eta && (
                            <div
                              className="flex items-center gap-1.5 mt-1"
                              style={{ color: '#86868B' }}
                            >
                              <Clock size={12} />
                              ETA: {formatDate(order.eta)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm font-medium transition-colors duration-150"
                          style={{ color: '#007AFF' }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = '#0051D5')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = '#007AFF')
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="px-6 py-4 border-t flex items-center justify-between"
                style={{ borderColor: 'rgba(0,0,0,0.06)' }}
              >
                <div className="text-sm" style={{ color: '#86868B' }}>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg transition-colors duration-150 disabled:opacity-40"
                    style={{ background: 'rgba(0,0,0,0.04)' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: '#007AFF', color: '#fff' }}
                  >
                    {currentPage}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg transition-colors duration-150 disabled:opacity-40"
                    style={{ background: 'rgba(0,0,0,0.04)' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl p-6"
            style={{ background: '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-semibold"
                style={{ color: '#1D1D1F' }}
              >
                Order Details
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg transition-colors duration-150"
                style={{ color: '#86868B' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                ✕
              </button>
            </div>

            {/* Order Basic Info */}
            <div
              className="rounded-xl p-5 mb-6"
              style={{ background: '#F5F5F7' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: '#86868B' }}
                  >
                    Order Number
                  </div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: '#1D1D1F' }}
                  >
                    {selectedOrder.orderNo}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: '#86868B' }}
                  >
                    Status
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: `${getStatusColor(selectedOrder.status)}15`,
                      color: getStatusColor(selectedOrder.status),
                    }}
                  >
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <div
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: '#86868B' }}
                  >
                    Origin Port
                  </div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: '#1D1D1F' }}
                  >
                    {selectedOrder.pol}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: '#86868B' }}
                  >
                    Destination Port
                  </div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: '#1D1D1F' }}
                  >
                    {selectedOrder.pod}
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Nodes */}
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: '#1D1D1F' }}
            >
              Tracking History
            </h3>
            {selectedOrder.tracking && selectedOrder.tracking.length > 0 ? (
              <div className="space-y-4">
                {selectedOrder.tracking.map((node, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background:
                            index === 0 ? '#007AFF' : '#C7C7CC',
                        }}
                      />
                      {index < selectedOrder.tracking!.length - 1 && (
                        <div
                          className="w-0.5 flex-1 mt-1"
                          style={{ background: '#E5E5EA' }}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div
                        className="font-medium text-sm"
                        style={{ color: '#1D1D1F' }}
                      >
                        {node.status}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: '#86868B' }}
                      >
                        {node.location} · {new Date(node.time).toLocaleString('en-US')}
                      </div>
                      {node.description && (
                        <div
                          className="text-xs mt-1"
                          style={{ color: '#6E6E73' }}
                        >
                          {node.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-8 rounded-xl"
                style={{ background: '#F5F5F7' }}
              >
                <Clock
                  size={32}
                  style={{ color: '#C7C7CC', margin: '0 auto 8px' }}
                />
                <p style={{ color: '#86868B', fontSize: 14 }}>
                  No tracking information available
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
