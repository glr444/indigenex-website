import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Mail, Eye, CheckCircle, MessageSquare } from 'lucide-react'

interface Contact {
  id: string
  fullName: string
  company?: string
  email: string
  inquiryType: string
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

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchContacts() }, [])

  const fetchContacts = async () => {
    try {
      const res = await axios.get('/api/contact')
      setContacts(res.data.data.contacts || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await axios.patch(`/api/contact/${id}/read`)
      fetchContacts()
    } catch {
      alert('标记已读失败')
    }
  }

  const unreadCount = contacts.filter(c => !c.isRead).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.5px', margin: 0 }}>留言管理</h1>
          <p style={{ fontSize: 14, color: '#86868B', marginTop: 4 }}>
            共 {contacts.length} 条{unreadCount > 0 ? ` · ${unreadCount} 条未读` : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 20,
            background: 'rgba(255,59,48,0.08)', color: '#FF3B30',
            fontSize: 13, fontWeight: 600,
          }}>
            <Mail size={14} />
            {unreadCount} 条新消息
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#86868B', fontSize: 14 }}>加载中...</div>
      ) : contacts.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 14, padding: '60px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
          textAlign: 'center',
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,122,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageSquare size={24} color="#007AFF" strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', margin: '0 0 6px' }}>暂无留言</p>
          <p style={{ fontSize: 14, color: '#86868B', margin: 0 }}>联系表单提交后将显示在这里。</p>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 140px 100px 120px 80px',
            padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#FAFAFA',
          }}>
            {['联系人', '咨询类型', '状态', '日期', '操作'].map((h, i) => (
              <div key={h} style={{ fontSize: 12, fontWeight: 600, color: '#86868B', letterSpacing: '0.3px', textAlign: i === 4 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>

          {contacts.map((contact, idx) => {
            const style = inquiryColors[contact.inquiryType] || inquiryColors.GENERAL
            return (
              <Link
                key={contact.id}
                to={`/contacts/${contact.id}`}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 140px 100px 120px 80px',
                  padding: '10px 16px', alignItems: 'center',
                  borderBottom: idx < contacts.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  textDecoration: 'none', color: 'inherit',
                  background: !contact.isRead ? 'rgba(0,122,255,0.02)' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F9F9FB')}
                onMouseLeave={e => (e.currentTarget.style.background = !contact.isRead ? 'rgba(0,122,255,0.02)' : 'transparent')}
              >
                {/* From */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {!contact.isRead && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#007AFF', flexShrink: 0 }} />
                  )}
                  {contact.isRead && <div style={{ width: 7, flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: contact.isRead ? 400 : 600, color: '#1D1D1F' }}>{contact.fullName}</div>
                    <div style={{ fontSize: 12, color: '#86868B' }}>{contact.email}</div>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    padding: '3px 9px', borderRadius: 20,
                    background: style.bg, color: style.color,
                  }}>
                    {inquiryLabels[contact.inquiryType] || contact.inquiryType}
                  </span>
                </div>

                {/* Status */}
                <div>
                  {contact.isRead ? (
                    <span style={{ fontSize: 12, color: '#86868B', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={13} color="#34C759" /> 已读
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#007AFF' }}>新消息</span>
                  )}
                </div>

                {/* Date */}
                <div style={{ fontSize: 13, color: '#86868B' }}>
                  {new Date(contact.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#86868B',
                  }}>
                    <Eye size={15} strokeWidth={1.5} />
                  </div>
                  {!contact.isRead && (
                    <button
                      onClick={e => handleMarkAsRead(contact.id, e)}
                      style={{
                        width: 30, height: 30, borderRadius: 8, border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent', cursor: 'pointer', color: '#34C759',
                      }}
                      title="Mark as read"
                    >
                      <CheckCircle size={15} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
