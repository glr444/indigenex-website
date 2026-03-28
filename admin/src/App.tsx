import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import NewsList from './pages/news/NewsList'
import NewsEdit from './pages/news/NewsEdit'
import ContactList from './pages/contact/ContactList'
import ContactDetail from './pages/contact/ContactDetail'
import FreightRateList from './pages/freight-rates/FreightRateList'
import FreightRateEdit from './pages/freight-rates/FreightRateEdit'
import MemberList from './pages/members/MemberList'
import CustomerList from './pages/customers/CustomerList'
import CustomerDetail from './pages/customers/CustomerDetail'
import CustomerEdit from './pages/customers/CustomerEdit'
import PortList from './pages/ports/PortList'
import RouteList from './pages/routes/RouteList'
import RouteEdit from './pages/routes/RouteEdit'
import CarrierList from './pages/carriers/CarrierList'
import CarrierEdit from './pages/carriers/CarrierEdit'
import ApiKeyList from './pages/api-keys/ApiKeyList'
import OrderList from './pages/orders/OrderList'

// 占位页面组件
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', padding: '60px 40px' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #34C759 0%, #248A3D 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 40,
        }}>
          🚧
        </div>
        <h1 style={{
          fontSize: 24,
          fontWeight: 600,
          color: '#1D1D1F',
          margin: '0 0 12px',
          letterSpacing: '-0.5px',
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: 14,
          color: '#86868B',
          margin: 0,
        }}>
          功能正在开发中，敬请期待...
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={
          <ProtectedRoute requireFirstLogin>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* 门户管理 */}
          <Route path="news" element={<NewsList />} />
          <Route path="news/new" element={<NewsEdit />} />
          <Route path="news/edit/:id" element={<NewsEdit />} />
          {/* 客商管理 */}
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/new" element={<CustomerEdit />} />
          <Route path="customers/edit/:id" element={<CustomerEdit />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="suppliers" element={<PlaceholderPage title="供应商管理" />} />
          <Route path="members" element={<MemberList />} />
          {/* 运价管理 */}
          <Route path="freight-rates" element={<FreightRateList />} />
          <Route path="freight-rates/new" element={<FreightRateEdit />} />
          <Route path="freight-rates/edit/:id" element={<FreightRateEdit />} />
          <Route path="contacts" element={<ContactList />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          {/* 订单管理 */}
          <Route path="orders" element={<OrderList />} />
          {/* 基础资料 */}
          <Route path="ports" element={<PortList />} />
          <Route path="routes" element={<RouteList />} />
          <Route path="routes/new" element={<RouteEdit />} />
          <Route path="routes/edit/:id" element={<RouteEdit />} />
          <Route path="carriers" element={<CarrierList />} />
          <Route path="carriers/new" element={<CarrierEdit />} />
          <Route path="carriers/edit/:id" element={<CarrierEdit />} />
          {/* 系统设置 */}
          <Route path="api-keys" element={<ApiKeyList />} />
          <Route path="staff" element={<PlaceholderPage title="员工管理" />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
