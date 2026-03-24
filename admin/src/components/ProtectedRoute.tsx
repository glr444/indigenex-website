import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireFirstLogin?: boolean
}

export default function ProtectedRoute({ children, requireFirstLogin = false }: ProtectedRouteProps) {
  // requireFirstLogin 用于标记修改密码页面，当前逻辑已在 AuthContext 中处理
  void requireFirstLogin;
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
