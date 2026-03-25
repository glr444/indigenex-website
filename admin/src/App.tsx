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
import PortList from './pages/ports/PortList'
import RouteList from './pages/routes/RouteList'
import RouteEdit from './pages/routes/RouteEdit'
import CarrierList from './pages/carriers/CarrierList'
import CarrierEdit from './pages/carriers/CarrierEdit'

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
          <Route path="news" element={<NewsList />} />
          <Route path="news/new" element={<NewsEdit />} />
          <Route path="news/edit/:id" element={<NewsEdit />} />
          <Route path="contacts" element={<ContactList />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="freight-rates" element={<FreightRateList />} />
          <Route path="freight-rates/new" element={<FreightRateEdit />} />
          <Route path="freight-rates/edit/:id" element={<FreightRateEdit />} />
          <Route path="members" element={<MemberList />} />
          <Route path="ports" element={<PortList />} />
          <Route path="routes" element={<RouteList />} />
          <Route path="routes/new" element={<RouteEdit />} />
          <Route path="routes/edit/:id" element={<RouteEdit />} />
          <Route path="carriers" element={<CarrierList />} />
          <Route path="carriers/new" element={<CarrierEdit />} />
          <Route path="carriers/edit/:id" element={<CarrierEdit />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
