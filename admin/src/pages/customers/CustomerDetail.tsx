import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Edit2,
  MessageSquare,
  Building2,
  User,
  Phone,
  Mail,
  FileText,
  Package,
  Calendar,
  Star,
  Users,
  Plus,
  Trash2,
  Download
} from 'lucide-react'
import { customerApi } from '../../utils/api'

interface Customer {
  id: string
  name: string
  creditCode: string | null
  industry: string | null
  scale: string | null
  preferredRoutes: string[]
  settlementType: string | null
  level: string | null
  type: string | null
  monthlyVolume: number | null
  transportModes: string[]
  targetRoutes: string | null
  requirements: string | null
  competition: string | null
  tags: string[]
  status: string
  ownerId: string | null
  source: string
  createdAt: string
  updatedAt: string
  lastFollowUpAt: string | null
  contacts: Contact[]
  followUps: FollowUp[]
  attachments: Attachment[]
}

interface Contact {
  id: string
  name: string
  position: string | null
  phone: string | null
  wechat: string | null
  email: string | null
  isPrimary: boolean
}

interface FollowUp {
  id: string
  method: string
  content: string
  feedback: string | null
  nextFollowUpAt: string | null
  createdAt: string
  userId: string
}

interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size: number
  uploadedBy: string
  createdAt: string
}

interface Tab {
  id: string
  label: string
  icon: React.ElementType
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    if (id) {
      fetchCustomer()
    }
  }, [id])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const response = await customerApi.getById(id!)
      if (response.success) {
        setCustomer(response.data as Customer)
      }
    } catch (err) {
      console.error('Fetch customer error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'A': return '#FF3B30'
      case 'B': return '#FF9500'
      case 'C': return '#007AFF'
      case 'D': return '#34C759'
      default: return '#8E8E93'
    }
  }

  const getLevelText = (level: string | null) => {
    switch (level) {
      case 'A': return 'A级'
      case 'B': return 'B级'
      case 'C': return 'C级'
      case 'D': return 'D级'
      default: return '未分级'
    }
  }

  const getTypeText = (type: string | null) => {
    switch (type) {
      case 'direct': return '直客'
      case 'peer': return '同行'
      case 'agent': return '代理'
      default: return '-'
    }
  }

  const getMethodText = (method: string) => {
    switch (method) {
      case 'phone': return '电话'
      case 'wechat': return '微信'
      case 'email': return '邮件'
      case 'visit': return '拜访'
      default: return '其他'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'phone': return <Phone size={14} />
      case 'wechat': return <MessageSquare size={14} />
      case 'email': return <Mail size={14} />
      case 'visit': return <User size={14} />
      default: return <MessageSquare size={14} />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const tabs: Tab[] = [
    { id: 'basic', label: '基本信息', icon: Building2 },
    { id: 'profile', label: '客户画像', icon: Star },
    { id: 'contacts', label: `联系人(${customer?.contacts?.length || 0})`, icon: Users },
    { id: 'followups', label: `跟进记录(${customer?.followUps?.length || 0})`, icon: MessageSquare },
    { id: 'orders', label: '成交记录', icon: Package },
    { id: 'attachments', label: '附件', icon: FileText }
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: '#86868B' }}>{t('common.loading', '加载中...')}</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: '#86868B' }}>{t('customers.notFound', '客户不存在')}</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F5F5F7' }}>
      {/* 第一行：返回 + 客户名称 + 操作按钮 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: '#fff',
        flexShrink: 0
      }}>
        {/* 左侧：返回 + 客户名称 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              border: '1px solid rgba(0,0,0,0.08)',
              background: '#fff',
              color: '#3A3A3C',
              fontSize: 12,
              cursor: 'pointer',
              borderRadius: 4,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F5F5F7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff'
            }}
          >
            <ArrowLeft size={12} />
            返回
          </button>

          <h1 style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#1D1D1F',
            margin: 0
          }}>
            {customer.name}
          </h1>
        </div>

        {/* 右侧：操作按钮 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate(`/customers/edit/${id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 12px',
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              background: '#fff',
              color: '#3A3A3C',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            <Edit2 size={12} />
            编辑
          </button>
          <button
            onClick={() => {}}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 12px',
              borderRadius: 4,
              border: 'none',
              background: '#007AFF',
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={12} />
            跟进
          </button>
        </div>
      </div>

      {/* 第二行：等级标签 + 客户标签 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 16px',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        flexShrink: 0
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          background: `${getLevelColor(customer.level)}15`,
          color: getLevelColor(customer.level)
        }}>
          <Star size={10} />
          {getLevelText(customer.level)}
        </span>
        {customer.tags && customer.tags.map((tag, idx) => (
          <span
            key={idx}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              background: '#F5F5F7',
              color: '#3A3A3C',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 第三行：TAB栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '0 16px',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        flexShrink: 0
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '10px 16px',
                borderRadius: 0,
                border: 'none',
                borderBottom: isActive ? '2px solid #007AFF' : '2px solid transparent',
                background: 'transparent',
                fontSize: 12,
                color: isActive ? '#007AFF' : '#3A3A3C',
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: -1
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content - 与上方对齐，16px边距 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 16
      }}>
        {/* 基本信息 */}
        {activeTab === 'basic' && (
          <div style={{
            background: '#fff',
            borderRadius: 4,
            padding: 16,
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', margin: '0 0 12px' }}>
              基本信息
            </h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <InfoItem label="公司名称" value={customer.name} />
                <InfoItem label="统一社会信用代码" value={customer.creditCode || '-'} />
                <InfoItem label="行业类型" value={customer.industry || '-'} />
              </div>
              <div style={{ flex: 1 }}>
                <InfoItem label="公司规模" value={customer.scale || '-'} />
                <InfoItem
                  label="主要业务航线/区域"
                  value={customer.preferredRoutes?.join('、') || '-'}
                />
                <InfoItem label="结算方式偏好" value={customer.settlementType || '-'} />
              </div>
              <div style={{ flex: 1 }}>
                <InfoItem label="归属销售" value="张三" avatar="张" />
                <InfoItem
                  label="创建时间"
                  value={new Date(customer.createdAt).toLocaleString('zh-CN')}
                />
                <InfoItem label="客户来源" value={customer.source || '-'} />
              </div>
            </div>
          </div>
        )}

        {/* 客户画像 */}
        {activeTab === 'profile' && (
          <div style={{
            background: '#fff',
            borderRadius: 4,
            padding: 16,
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', margin: '0 0 12px' }}>
              客户画像
            </h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <InfoItem label="客户等级" value={getLevelText(customer.level)} />
                <InfoItem label="客户类型" value={getTypeText(customer.type)} />
                <InfoItem
                  label="月货量预估"
                  value={customer.monthlyVolume ? `${customer.monthlyVolume} TEU` : '-'}
                />
              </div>
              <div style={{ flex: 1 }}>
                <InfoItem
                  label="运输方式"
                  value={customer.transportModes?.join('、') || '-'}
                />
                <InfoItem label="目标航线" value={customer.targetRoutes || '-'} />
                <InfoItem label="特殊需求" value={customer.requirements || '-'} />
              </div>
              <div style={{ flex: 1 }}>
                <InfoItem label="竞争情况" value={customer.competition || '-'} />
              </div>
            </div>
          </div>
        )}

        {/* 联系人 */}
        {activeTab === 'contacts' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>
                联系人列表
              </h3>
              <button
                onClick={() => {}}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 12px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#007AFF',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} />
                添加联系人
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {customer.contacts?.map(contact => (
                <div
                  key={contact.id}
                  style={{
                    background: '#fff',
                    borderRadius: 4,
                    padding: 12,
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        background: '#007AFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F' }}>
                            {contact.name}
                          </span>
                          {contact.isPrimary && (
                            <span style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              background: '#34C759',
                              color: '#fff'
                            }}>
                              主联系人
                            </span>
                          )}
                        </div>
                        {contact.position && (
                          <div style={{ fontSize: 11, color: '#86868B' }}>
                            {contact.position}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        style={{
                          padding: 4,
                          borderRadius: 4,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#007AFF'
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        style={{
                          padding: 4,
                          borderRadius: 4,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#FF3B30'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: 16,
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    {contact.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3A3A3C' }}>
                        <Phone size={12} />
                        {contact.phone}
                      </div>
                    )}
                    {contact.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3A3A3C' }}>
                        <Mail size={12} />
                        {contact.email}
                      </div>
                    )}
                    {contact.wechat && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3A3A3C' }}>
                        <MessageSquare size={12} />
                        {contact.wechat}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!customer.contacts?.length && (
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  color: '#86868B',
                  background: '#fff',
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <Users size={32} style={{ marginBottom: 8, color: '#C7C7CC' }} />
                  暂无联系人
                </div>
              )}
            </div>
          </div>
        )}

        {/* 跟进记录 */}
        {activeTab === 'followups' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>
                跟进记录
              </h3>
              <button
                onClick={() => {}}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 12px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#007AFF',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} />
                新增跟进
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {customer.followUps?.map(followUp => (
                <div
                  key={followUp.id}
                  style={{
                    background: '#fff',
                    borderRadius: 4,
                    padding: 12,
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      background: '#F5F5F7',
                      color: '#3A3A3C',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      {getMethodIcon(followUp.method)}
                      {getMethodText(followUp.method)}
                    </span>
                    <span style={{ fontSize: 11, color: '#86868B' }}>
                      <Calendar size={11} style={{ marginRight: 3 }} />
                      {new Date(followUp.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#1D1D1F', lineHeight: 1.6 }}>
                    {followUp.content}
                  </div>
                  {followUp.feedback && (
                    <div style={{
                      marginTop: 8,
                      padding: 8,
                      background: '#F5F5F7',
                      borderRadius: 4,
                      fontSize: 11,
                      color: '#3A3A3C'
                    }}>
                      <strong>客户反馈：</strong>{followUp.feedback}
                    </div>
                  )}
                  {followUp.nextFollowUpAt && (
                    <div style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: '#FF9500'
                    }}>
                      下次跟进：{new Date(followUp.nextFollowUpAt).toLocaleString('zh-CN')}
                    </div>
                  )}
                </div>
              ))}
              {!customer.followUps?.length && (
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  color: '#86868B',
                  background: '#fff',
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <MessageSquare size={32} style={{ marginBottom: 8, color: '#C7C7CC' }} />
                  暂无跟进记录
                </div>
              )}
            </div>
          </div>
        )}

        {/* 成交记录 */}
        {activeTab === 'orders' && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: '#86868B',
            background: '#fff',
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <Package size={32} style={{ marginBottom: 8, color: '#C7C7CC' }} />
            成交记录功能开发中...
          </div>
        )}

        {/* 附件 */}
        {activeTab === 'attachments' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>
                附件列表
              </h3>
              <button
                onClick={() => {}}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 12px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#007AFF',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} />
                上传附件
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {customer.attachments?.map(attachment => (
                <div
                  key={attachment.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 10,
                    background: '#fff',
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={20} style={{ color: '#007AFF' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#1D1D1F' }}>
                        {attachment.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#86868B' }}>
                        {formatFileSize(attachment.size)} · {new Date(attachment.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      style={{
                        padding: 4,
                        borderRadius: 4,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#007AFF'
                      }}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      style={{
                        padding: 4,
                        borderRadius: 4,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#FF3B30'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {!customer.attachments?.length && (
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  color: '#86868B',
                  background: '#fff',
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <FileText size={32} style={{ marginBottom: 8, color: '#C7C7CC' }} />
                  暂无附件
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 信息项组件
function InfoItem({ label, value, avatar }: { label: string; value: string; avatar?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: '#86868B', marginBottom: 2 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {avatar && (
          <div style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: '#007AFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 9,
            fontWeight: 600
          }}>
            {avatar}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#1D1D1F', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
}
