import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Newspaper, MessageSquare, LogOut, ChevronRight, Ship, Users, Anchor, Globe } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(newLang)
  }

  const navItems = [
    { label: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.news'), href: '/news', icon: Newspaper },
    { label: t('nav.contacts'), href: '/contacts', icon: MessageSquare },
    { label: t('nav.freightRates'), href: '/freight-rates', icon: Ship },
    { label: t('nav.members'), href: '/members', icon: Users },
    { label: t('nav.ports'), href: '/ports', icon: Anchor },
  ]

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/')

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F5F7' }}>

      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="logo.png"
              alt="Cargo GM"
              style={{
                width: 32, height: 32,
                borderRadius: 8,
                objectFit: 'contain',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.2px' }}>Cargo GM</div>
              <div style={{ fontSize: 11, color: '#86868B', marginTop: 1 }}>Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868B', letterSpacing: '0.5px', padding: '8px 10px 6px', textTransform: 'uppercase' }}>
            Menu
          </div>
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 8,
                  marginBottom: 2,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#007AFF' : '#3A3A3C',
                  background: active ? 'rgba(0,122,255,0.08)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <item.icon size={17} strokeWidth={active ? 2 : 1.5} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={14} style={{ opacity: 0.4 }} />}
              </Link>
            )
          })}
        </nav>

        {/* Language Switcher */}
        <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            onClick={toggleLanguage}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: 400, color: '#3A3A3C',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Globe size={15} strokeWidth={1.5} />
            <span style={{ flex: 1 }}>{t('language.title')}</span>
            <span style={{ fontSize: 12, color: '#86868B' }}>
              {i18n.language === 'zh' ? '中文' : 'English'}
            </span>
          </button>
        </div>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            background: 'rgba(0,0,0,0.02)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #34C759, #248A3D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1D1D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: 11, color: '#86868B' }}>{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', marginTop: 4,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: 400, color: '#FF3B30',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,59,48,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={15} strokeWidth={1.5} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          height: 52,
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, color: '#86868B' }}>
            {navItems.find(n => isActive(n.href))?.label || 'Admin'}
          </div>
        </div>

        <div style={{ flex: 1, padding: '28px 28px', overflow: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
