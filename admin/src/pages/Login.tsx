import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userFocus, setUserFocus] = useState(false)
  const [passFocus, setPassFocus] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      // error handled in context
    } finally {
      setIsLoading(false)
    }
  }

  const inputWrap = (focused: boolean): React.CSSProperties => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 46,
    background: focused ? '#fff' : '#F5F5F7',
    border: `1px solid ${focused ? '#007AFF' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: 10,
    boxShadow: focused ? '0 0 0 3px rgba(0,122,255,0.12)' : 'none',
    transition: 'all 0.15s ease',
    overflow: 'hidden',
  })

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    color: '#1D1D1F',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    padding: '0 12px 0 38px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100%', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>

      {/* Left — Beach Image */}
      <div style={{ width: '60%', height: '100%', flexShrink: 0, position: 'relative' }}>
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop"
          alt="Beach"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Subtle brand overlay bottom-left */}
        <div style={{
          position: 'absolute', bottom: 32, left: 32,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <img
            src="logo.png"
            alt="大掌柜"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              objectFit: 'contain',
              padding: 4,
            }}
          />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Carggo GM
          </span>
        </div>
      </div>

      {/* Right — Login Form */}
      <div style={{
        width: '40%', height: '100%', background: '#F5F5F7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto', padding: '40px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img
              src="logo.png"
              alt="大掌柜"
              style={{
                width: 120, height: 'auto',
                margin: '0 auto 16px',
                display: 'block',
              }}
              onError={(e) => {
                // 如果图片加载失败，显示 fallback
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = document.getElementById('logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback 如果图片不存在 */}
            <div
              id="logo-fallback"
              style={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #007AFF, #0055D4)',
                borderRadius: 14,
                display: 'none', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 16px rgba(0,122,255,0.35)',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>大</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.5px', margin: 0 }}>
              欢迎登录
            </h1>
          </div>

          {/* Card */}
          <div style={{
            background: '#fff', borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
            padding: '24px 24px 20px',
          }}>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.2)',
                fontSize: 13, color: '#FF3B30',
              }}>
                <AlertCircle size={15} strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Username */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#86868B', letterSpacing: '0.3px', marginBottom: 6, textTransform: 'uppercase' }}>用户名</div>
                <div style={inputWrap(userFocus)}>
                  <User size={15} strokeWidth={1.5} style={{ position: 'absolute', left: 12, color: userFocus ? '#007AFF' : '#86868B', transition: 'color 0.15s' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => setUserFocus(true)}
                    onBlur={() => setUserFocus(false)}
                    placeholder="请输入用户名"
                    required
                    style={{ ...inputStyle, paddingLeft: 38 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#86868B', letterSpacing: '0.3px', marginBottom: 6, textTransform: 'uppercase' }}>密码</div>
                <div style={inputWrap(passFocus)}>
                  <Lock size={15} strokeWidth={1.5} style={{ position: 'absolute', left: 12, color: passFocus ? '#007AFF' : '#86868B', transition: 'color 0.15s' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocus(true)}
                    onBlur={() => setPassFocus(false)}
                    placeholder="请输入密码"
                    required
                    style={{ ...inputStyle, paddingLeft: 38, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 10,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#86868B', display: 'flex', alignItems: 'center', padding: 4,
                    }}
                  >
                    {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    style={{
                      width: 38, height: 22, borderRadius: 11,
                      background: rememberMe ? '#34C759' : '#D1D1D6',
                      position: 'relative', cursor: 'pointer',
                      transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3,
                      left: rememberMe ? 19 : 3,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#3A3A3C' }}>记住账号</span>
                </label>
                <button type="button" style={{
                  fontSize: 13, color: '#007AFF', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  忘记密码？
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: 4,
                  height: 46, borderRadius: 10, border: 'none',
                  background: isLoading ? '#86868B' : 'linear-gradient(135deg, #007AFF, #0055D4)',
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading ? 'none' : '0 2px 12px rgba(0,122,255,0.35)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.5px',
                }}
              >
                {isLoading ? '登录中...' : '登 录'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 12, color: '#C7C7CC', marginTop: 20 }}>
            © 2026 大掌柜官网后台管理系统
          </p>
        </div>
      </div>
    </div>
  )
}
