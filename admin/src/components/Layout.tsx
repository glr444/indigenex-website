import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Newspaper, LogOut, ChevronRight, Ship,
  PanelLeftClose, PanelLeft, ChevronDown, Building2, Settings, ClipboardList, Globe
} from 'lucide-react'

// Tooltip 组件
function Tooltip({ children, content, visible }: { children: React.ReactNode; content: string; visible: boolean }) {
  const [show, setShow] = useState(false)

  if (!visible) return <>{children}</>

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: 8,
            padding: '6px 10px',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            fontSize: 12,
            borderRadius: 6,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              left: -4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderRight: '4px solid rgba(0,0,0,0.8)',
            }}
          />
        </div>
      )}
    </div>
  )
}

interface SubMenuItem {
  label: string
  href: string
}

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: SubMenuItem[]
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(newLang)
  }

  const toggleSubMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const navItems: NavItem[] = [
    { label: '首页', href: '/dashboard', icon: LayoutDashboard },
    { label: '门户管理', href: '/news', icon: Newspaper },
    {
      label: '客商管理',
      icon: Building2,
      children: [
        { label: '客户管理', href: '/customers' },
        { label: '供应商管理', href: '/suppliers' },
        { label: '会员管理', href: '/members' },
      ]
    },
    {
      label: '运价管理',
      icon: Ship,
      children: [
        { label: '运价维护', href: '/freight-rates' },
        { label: '询盘管理', href: '/contacts' },
      ]
    },
    {
      label: '订单管理',
      icon: ClipboardList,
      children: [
        { label: '订单列表', href: '/orders' },
      ]
    },
    {
      label: '基础资料',
      icon: Settings,
      children: [
        { label: '港口管理', href: '/ports' },
        { label: '航线管理', href: '/routes' },
        { label: '船公司管理', href: '/carriers' },
      ]
    },
    {
      label: '系统设置',
      icon: Globe,
      children: [
        { label: 'API授权管理', href: '/api-keys' },
        { label: '员工管理', href: '/staff' },
      ]
    },
  ]

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/')

  const isMenuActive = (item: NavItem) => {
    if (item.href) return isActive(item.href)
    if (item.children) {
      return item.children.some(child => isActive(child.href))
    }
    return false
  }

  const renderNavItem = (item: NavItem) => {
    const active = isMenuActive(item)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedMenus.includes(item.label)

    if (hasChildren) {
      return (
        <div key={item.label}>
          <Tooltip content={item.label} visible={collapsed}>
            <button
              onClick={() => !collapsed && toggleSubMenu(item.label)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                border: 'none',
                background: active ? 'rgba(0,122,255,0.08)' : 'transparent',
                cursor: collapsed ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? '#007AFF' : '#3A3A3C',
                transition: 'all 0.15s ease',
              }}
            >
              <item.icon size={collapsed ? 20 : 17} strokeWidth={active ? 2 : 1.5} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  <ChevronDown
                    size={14}
                    style={{
                      opacity: 0.4,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </>
              )}
            </button>
          </Tooltip>
          {!collapsed && isExpanded && (
            <div style={{ paddingLeft: 32 }}>
              {item.children?.map((child) => {
                const childActive = isActive(child.href)
                return (
                  <Link
                    key={child.href}
                    to={child.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 6,
                      marginBottom: 2,
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: childActive ? 600 : 400,
                      color: childActive ? '#007AFF' : '#3A3A3C',
                      background: childActive ? 'rgba(0,122,255,0.06)' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ flex: 1 }}>{child.label}</span>
                    {childActive && <ChevronRight size={12} style={{ opacity: 0.4 }} />}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <Tooltip key={item.label} content={item.label} visible={collapsed}>
        <Link
          to={item.href!}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 10,
            padding: collapsed ? '10px' : '10px 12px',
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
          <item.icon size={collapsed ? 20 : 17} strokeWidth={active ? 2 : 1.5} />
          {!collapsed && (
            <>
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={14} style={{ opacity: 0.4 }} />}
            </>
          )}
        </Link>
      </Tooltip>
    )
  }

  // 获取当前页面标题
  const getCurrentTitle = () => {
    for (const item of navItems) {
      if (item.href && isActive(item.href)) {
        return item.label
      }
      if (item.children) {
        const child = item.children.find(c => isActive(c.href))
        if (child) {
          return `${item.label} / ${child.label}`
        }
      }
    }
    return 'Admin'
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F5F7' }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s ease',
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 16px' : '24px 20px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {collapsed ? (
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
          ) : (
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
          )}
        </div>

        {/* Collapse Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          padding: '8px',
        }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: 6,
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#86868B',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={collapsed ? '展开菜单' : '收起菜单'}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
              e.currentTarget.style.color = '#3A3A3C'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#86868B'
            }}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '8px' : '4px 8px', overflow: 'auto' }}>
          {navItems.map(renderNavItem)}
        </nav>

        {/* Language Switcher */}
        <div style={{ padding: collapsed ? '8px' : '8px 10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Tooltip content={t('language.title')} visible={collapsed}>
            <button
              onClick={toggleLanguage}
              style={{
                width: collapsed ? 44 : '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
                padding: collapsed ? '10px' : '8px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 400,
                color: '#3A3A3C',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Globe size={15} strokeWidth={1.5} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{t('language.title')}</span>
                  <span style={{ fontSize: 12, color: '#86868B' }}>
                    {i18n.language === 'zh' ? '中文' : 'English'}
                  </span>
                </>
              )}
            </button>
          </Tooltip>
        </div>

        {/* User */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px 10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {collapsed ? (
            <Tooltip content={`${user?.username} (${user?.role})`} visible={true}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #34C759, #248A3D)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 auto',
                }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>
            </Tooltip>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.02)',
            }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34C759, #248A3D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#1D1D1F',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.username}
                </div>
                <div style={{ fontSize: 11, color: '#86868B' }}>{user?.role}</div>
              </div>
            </div>
          )}
          <Tooltip content={t('nav.logout')} visible={collapsed}>
            <button
              onClick={handleLogout}
              style={{
                width: collapsed ? 44 : '100%',
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
                padding: collapsed ? '10px' : '8px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 400,
                color: '#FF3B30',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,59,48,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={15} strokeWidth={1.5} />
              {!collapsed && t('nav.logout')}
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        {/* Top bar */}
        <div style={{
          height: 40,
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, color: '#86868B' }}>
            {getCurrentTitle()}
          </div>
        </div>

        <div style={{ flex: 1, padding: 0, overflow: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
