'use client';

import { useEffect, useState } from 'react';
import {
  Package,
  Ship,
  TrendingUp,
  Clock,
  ArrowRight,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  activeRates: number;
  pendingOrders: number;
  recentOrders: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeRates: 0,
    pendingOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('memberToken');

      // Get orders list (limit 5)
      const ordersRes = await fetch(
        '/api/orders?page=1&limit=5',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const ordersData = await ordersRes.json();

      // Get freight rates stats
      const ratesRes = await fetch(
        '/api/freight-rates/public?page=1&limit=1',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const ratesData = await ratesRes.json();

      setStats({
        totalOrders: ordersData.data?.total || 0,
        activeRates: ratesData.data?.total || 0,
        pendingOrders: ordersData.data?.orders?.filter((o: any) =>
          o.status === 'PENDING' || o.status === 'PROCESSING'
        ).length || 0,
        recentOrders: ordersData.data?.orders?.slice(0, 5) || [],
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: '#007AFF',
      href: '/portal/orders',
    },
    {
      title: 'Active Rates',
      value: stats.activeRates,
      icon: Ship,
      color: '#34C759',
      href: '/portal/freight-rates',
    },
    {
      title: 'In Progress',
      value: stats.pendingOrders,
      icon: Clock,
      color: '#FF9500',
      href: '/portal/orders',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#34C759';
      case 'PROCESSING':
        return '#007AFF';
      case 'PENDING':
        return '#FF9500';
      default:
        return '#86868B';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'COMPLETED': 'Completed',
      'PROCESSING': 'Processing',
      'PENDING': 'Pending',
      'CANCELLED': 'Cancelled',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: '#1D1D1F', letterSpacing: '-0.3px' }}
        >
          Welcome Back
        </h1>
        <p style={{ color: '#86868B', fontSize: 15 }}>
          Here's your logistics business overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="p-6 rounded-2xl transition-all duration-200 hover:shadow-lg"
            style={{
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: '#86868B' }}
                >
                  {card.title}
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: '#1D1D1F', letterSpacing: '-0.5px' }}
                >
                  {loading ? '-' : card.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}15` }}
              >
                <card.icon size={24} style={{ color: card.color }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: '#1D1D1F' }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/portal/orders"
            className="flex items-center gap-4 p-4 rounded-xl transition-colors duration-150"
            style={{ background: '#F5F5F7' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(0,122,255,0.08)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = '#F5F5F7')
            }
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#007AFF' }}
            >
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div
                className="font-medium text-sm"
                style={{ color: '#1D1D1F' }}
              >
                View Orders
              </div>
              <div className="text-xs" style={{ color: '#86868B' }}>
                Check your shipping order status
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#86868B' }} />
          </Link>

          <Link
            href="/portal/freight-rates"
            className="flex items-center gap-4 p-4 rounded-xl transition-colors duration-150"
            style={{ background: '#F5F5F7' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(52,199,89,0.08)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = '#F5F5F7')
            }
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#34C759' }}
            >
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div
                className="font-medium text-sm"
                style={{ color: '#1D1D1F' }}
              >
                Search Rates
              </div>
              <div className="text-xs" style={{ color: '#86868B' }}>
                View latest ocean freight rates
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#86868B' }} />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(0,0,0,0.06)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: '#1D1D1F' }}
          >
            Recent Orders
          </h2>
          <Link
            href="/portal/orders"
            className="text-sm flex items-center gap-1 transition-colors duration-150"
            style={{ color: '#007AFF' }}
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div className="p-8 text-center" style={{ color: '#86868B' }}>
              Loading...
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package
                size={40}
                style={{ color: '#C7C7CC', margin: '0 auto 12px' }}
              />
              <p style={{ color: '#86868B', fontSize: 14 }}>
                No orders yet
              </p>
            </div>
          ) : (
            stats.recentOrders.map((order) => (
              <div
                key={order.id || order.orderNo}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: '#F5F5F7' }}
                  >
                    <Package size={18} style={{ color: '#86868B' }} />
                  </div>
                  <div>
                    <div
                      className="font-medium text-sm"
                      style={{ color: '#1D1D1F' }}
                    >
                      {order.orderNo || order.blNo || 'Unnamed Order'}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#86868B' }}>
                      {order.pol || order.loadingPort} → {order.pod || order.destinationPort}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: `${getStatusColor(order.status)}15`,
                      color: getStatusColor(order.status),
                    }}
                  >
                    {getStatusText(order.status)}
                  </span>
                  <span className="text-xs" style={{ color: '#86868B' }}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-US')
                      : '-'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
