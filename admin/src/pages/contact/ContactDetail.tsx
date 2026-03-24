import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Mail, Building2, Phone, Calendar, CheckCircle, Clock, X } from 'lucide-react'

interface Contact {
  id: string
  fullName: string
  company?: string
  phone?: string
  email: string
  inquiryType: string
  details: string
  isRead: boolean
  createdAt: string
}

const inquiryLabels: Record<string, string> = {
  SHIPPING_QUOTE: '询价',
  TRACKING: '物流跟踪',
  CUSTOM_SOLUTION: '定制方案',
  GENERAL: '一般咨询',
}

const inquiryColors: Record<string, { bg: string; color: string }> = {
  SHIPPING_QUOTE: { bg: 'rgba(0,122,255,0.08)', color: '#007AFF' },
  TRACKING: { bg: 'rgba(52,199,89,0.08)', color: '#248A3D' },
  CUSTOM_SOLUTION: { bg: 'rgba(255,159,10,0.08)', color: '#B25000' },
  GENERAL: { bg: 'rgba(0,0,0,0.05)', color: '#3A3A3C' },
}

interface SlideOverPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  onMarkAsRead?: () => void
  showMarkAsRead?: boolean
}

// 右侧划入卡片组件
function SlideOverPanel({ isOpen, onClose, title, subtitle, children, onMarkAsRead, showMarkAsRead }: SlideOverPanelProps) {
  const [showBackdrop, setShowBackdrop] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowBackdrop(true)
      setTimeout(() => setShowPanel(true), 10)
      document.body.style.overflow = 'hidden'
    } else {
      setShowPanel(false)
      setTimeout(() => setShowBackdrop(false), 300)
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!showBackdrop && !isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      pointerEvents: showPanel ? 'auto' : 'none'
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          opacity: showPanel ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(480px, 100vw)',
        background: '#F5F5F7',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
        transform: showPanel ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                background: '#F5F5F7',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#86868B',
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1D1D1F',
                margin: 0,
                letterSpacing: '-0.2px'
              }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ fontSize: 13, color: '#86868B', margin: '2px 0 0' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {showMarkAsRead && onMarkAsRead && (
              <button
                onClick={onMarkAsRead}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#34C759',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(52,199,89,0.3)',
                  transition: 'all 0.15s ease'
                }}
              >
                <CheckCircle size={15} strokeWidth={2} />
                标记已读
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                background: '#F5F5F7',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#86868B',
                transition: 'all 0.15s ease'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: 24
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchContact = useCallback(async () => {
    if (!id) return
    try {
      const res = await axios.get(`/api/contact/${id}`)
      setContact(res.data.data.contact)
    } catch {
      alert('加载留言失败')
      navigate('/contacts')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchContact() }, [fetchContact])

  const handleMarkAsRead = async () => {
    if (!id) return
    try {
      await axios.patch(`/api/contact/${id}/read`)
      fetchContact()
    } catch {
      alert('标记已读失败')
    }
  }

  const handleClose = () => {
    navigate('/contacts')
  }

  if (loading) {
    return (
      <SlideOverPanel
        isOpen={true}
        onClose={handleClose}
        title="留言详情"
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ color: '#86868B', fontSize: 14 }}>加载中...</div>
        </div>
      </SlideOverPanel>
    )
  }

  if (!contact) {
    return (
      <SlideOverPanel
        isOpen={true}
        onClose={handleClose}
        title="留言详情"
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ color: '#86868B', fontSize: 14 }}>留言不存在</div>
        </div>
      </SlideOverPanel>
    )
  }

  const typeStyle = inquiryColors[contact.inquiryType] || inquiryColors.GENERAL

  return (
    <SlideOverPanel
      isOpen={true}
      onClose={handleClose}
      title="留言详情"
      subtitle={`接收时间 ${new Date(contact.createdAt).toLocaleString('zh-CN', { dateStyle: 'long', timeStyle: 'short' })}`}
      onMarkAsRead={handleMarkAsRead}
      showMarkAsRead={!contact.isRead}
    >
      {/* Sender card */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #007AFF, #0055D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}>
              {contact.fullName[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F' }}>{contact.fullName}</div>
              <div style={{ fontSize: 13, color: '#86868B', marginTop: 1 }}>{contact.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: 20,
              background: typeStyle.bg,
              color: typeStyle.color,
            }}>
              {inquiryLabels[contact.inquiryType] || contact.inquiryType}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 20,
              background: contact.isRead ? 'rgba(52,199,89,0.08)' : 'rgba(0,122,255,0.08)',
              color: contact.isRead ? '#248A3D' : '#007AFF',
            }}>
              {contact.isRead ? '✓ 已读' : '● 新消息'}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Mail size={15} color="#86868B" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#86868B',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                marginBottom: 2
              }}>邮箱</div>
              <a href={`mailto:${contact.email}`} style={{
                fontSize: 14,
                color: '#007AFF',
                textDecoration: 'none',
                wordBreak: 'break-all'
              }}>{contact.email}</a>
            </div>
          </div>

          {contact.phone && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Phone size={15} color="#86868B" strokeWidth={1.5} />
              </div>
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#86868B',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  marginBottom: 2
                }}>电话</div>
                <a href={`tel:${contact.phone}`} style={{
                  fontSize: 14,
                  color: '#007AFF',
                  textDecoration: 'none'
                }}>{contact.phone}</a>
              </div>
            </div>
          )}

          {contact.company && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Building2 size={15} color="#86868B" strokeWidth={1.5} />
              </div>
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#86868B',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  marginBottom: 2
                }}>公司</div>
                <div style={{ fontSize: 14, color: '#1D1D1F' }}>{contact.company}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Calendar size={15} color="#86868B" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#86868B',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                marginBottom: 2
              }}>接收时间</div>
              <div style={{ fontSize: 14, color: '#1D1D1F' }}>
                {new Date(contact.createdAt).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message card */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Clock size={14} color="#86868B" strokeWidth={1.5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#3A3A3C' }}>留言内容</span>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{
            fontSize: 15,
            color: '#1D1D1F',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            margin: 0,
          }}>
            {contact.details || '无留言内容'}
          </p>
        </div>
      </div>
    </SlideOverPanel>
  )
}
