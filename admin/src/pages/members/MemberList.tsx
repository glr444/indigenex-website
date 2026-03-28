import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  Building2,
  Mail,
  Phone,
  User
} from 'lucide-react'
import { memberApi } from '../../utils/api'

interface Member {
  id: string
  openid: string | null
  companyName: string
  contactName: string
  phone: string
  email: string | null
  status: string
  role: string
  position: string | null
  dazhangguiEnterpriseId: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  salesName?: string | null
  salesPhone?: string | null
  salesMobile?: string | null
  salesEmail?: string | null
}

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    position: '',
    role: 'MEMBER',
    dazhangguiEnterpriseId: '',
    salesName: '',
    salesPhone: '',
    salesMobile: '',
    salesEmail: ''
  })
  const [saving, setSaving] = useState(false)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus) params.append('status', filterStatus)
      params.append('page', currentPage.toString())
      params.append('limit', '20')

      const response = await memberApi.getAll(params.toString())
      if (response.success) {
        const data = response.data as any
        setMembers(data.members || [])
        setTotalPages(Math.ceil((data.total || 0) / 20))
      }
    } catch (err) {
      setError('获取会员列表失败')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterStatus, currentPage])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleApprove = async (id: string) => {
    try {
      await memberApi.approve(id)
      fetchMembers()
    } catch (err) {
      alert('审核失败')
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('确定要拒绝该会员申请吗？')) return
    try {
      await memberApi.reject(id)
      fetchMembers()
    } catch (err) {
      alert('操作失败')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await memberApi.toggleStatus(id)
      fetchMembers()
    } catch (err) {
      alert('操作失败')
    }
  }

  const handleOpenEdit = (member: Member) => {
    setSelectedMember(member)
    setEditForm({
      companyName: member.companyName || '',
      contactName: member.contactName || '',
      phone: member.phone || '',
      position: member.position || '',
      role: member.role || 'MEMBER',
      dazhangguiEnterpriseId: member.dazhangguiEnterpriseId || '',
      salesName: member.salesName || '',
      salesPhone: member.salesPhone || '',
      salesMobile: member.salesMobile || '',
      salesEmail: member.salesEmail || ''
    })
    setShowEditModal(true)
  }

  const handleSaveMember = async () => {
    if (!selectedMember) return
    setSaving(true)
    try {
      await memberApi.update(selectedMember.id, editForm)
      setShowEditModal(false)
      fetchMembers()
    } catch (err) {
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#34C759'
      case 'PENDING': return '#FF9500'
      case 'REJECTED': return '#FF3B30'
      case 'DISABLED': return '#8E8E93'
      default: return '#8E8E93'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return '已开通'
      case 'PENDING': return '待审核'
      case 'REJECTED': return '已拒绝'
      case 'DISABLED': return '已禁用'
      default: return status
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理员'
      case 'MEMBER': return '普通会员'
      default: return role
    }
  }

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#1D1D1F',
            margin: '0 0 2px',
            letterSpacing: '-0.5px'
          }}>
            会员管理
          </h1>
          <p style={{ fontSize: 13, color: '#86868B', margin: 0 }}>
            管理客户会员，审核注册申请
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#86868B'
              }}
            />
            <input
              type="text"
              placeholder="搜索企业名称、联系人、邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.08)',
              background: showFilters ? 'rgba(0,122,255,0.08)' : '#fff',
              color: showFilters ? '#007AFF' : '#3A3A3C',
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            <Filter size={14} />
            筛选
          </button>
        </div>

        {showFilters && (
          <div style={{
            display: 'flex',
            gap: 10,
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(0,0,0,0.06)'
          }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 13,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">全部状态</option>
              <option value="PENDING">待审核</option>
              <option value="APPROVED">已开通</option>
              <option value="REJECTED">已拒绝</option>
              <option value="DISABLED">已禁用</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F5F7' }}>
              <th style={thStyle}>企业信息</th>
              <th style={thStyle}>联系方式</th>
              <th style={thStyle}>状态</th>
              <th style={thStyle}>角色</th>
              <th style={thStyle}>注册时间</th>
              <th style={thStyle}>最后登录</th>
              <th style={{ ...thStyle, width: 160 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ color: '#86868B', fontSize: 13 }}>加载中...</div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                  <Building2 size={32} style={{ color: '#C7C7CC', marginBottom: 8 }} />
                  <div style={{ color: '#86868B', fontSize: 13 }}>暂无会员数据</div>
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr
                  key={member.id}
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600
                      }}>
                        {member.companyName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1D1D1F', fontSize: 13 }}>
                          {member.companyName}
                        </div>
                        <div style={{ fontSize: 11, color: '#86868B' }}>
                          {member.position || '无职务'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <User size={11} style={{ color: '#86868B' }} />
                        {member.contactName}
                      </div>
                      {member.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <Mail size={11} style={{ color: '#86868B' }} />
                          {member.email}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Phone size={11} style={{ color: '#86868B' }} />
                        {member.phone}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '3px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 500,
                      background: `${getStatusColor(member.status)}15`,
                      color: getStatusColor(member.status)
                    }}>
                      <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: getStatusColor(member.status)
                      }} />
                      {getStatusText(member.status)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 500,
                      background: member.role === 'ADMIN' ? '#E3F2FD' : '#F5F5F7',
                      color: member.role === 'ADMIN' ? '#1976D2' : '#3A3A3C'
                    }}>
                      {getRoleText(member.role)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 12, color: '#3A3A3C' }}>
                      {new Date(member.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 12, color: '#86868B' }}>
                      {member.lastLoginAt
                        ? new Date(member.lastLoginAt).toLocaleDateString('zh-CN')
                        : '从未登录'}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {member.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(member.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              border: 'none',
                              background: '#34C759',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleReject(member.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              border: 'none',
                              background: '#FF3B30',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            拒绝
                          </button>
                        </>
                      )}
                      {member.status === 'APPROVED' && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(member)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              border: '1px solid rgba(0,0,0,0.2)',
                              background: 'transparent',
                              color: '#3A3A3C',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleToggleStatus(member.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              border: '1px solid #FF3B30',
                              background: 'transparent',
                              color: '#FF3B30',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            禁用
                          </button>
                        </>
                      )}
                      {member.status === 'DISABLED' && (
                        <button
                          onClick={() => handleToggleStatus(member.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid #34C759',
                            background: 'transparent',
                            color: '#34C759',
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          启用
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          marginTop: 16
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: 'none',
                background: currentPage === page ? '#007AFF' : '#fff',
                color: currentPage === page ? '#fff' : '#3A3A3C',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: 560,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: 24
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>
                编辑会员 - {selectedMember.companyName}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#86868B'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Basic Info */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#3A3A3C', margin: '0 0 12px' }}>
                  基本信息
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>企业名称</label>
                    <input
                      type="text"
                      value={editForm.companyName}
                      onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.08)',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>联系人</label>
                      <input
                        type="text"
                        value={editForm.contactName}
                        onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(0,0,0,0.08)',
                          fontSize: 14,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>职务</label>
                      <input
                        type="text"
                        value={editForm.position}
                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(0,0,0,0.08)',
                          fontSize: 14,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>联系电话</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.08)',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>大掌柜企业ID</label>
                    <input
                      type="text"
                      value={editForm.dazhangguiEnterpriseId}
                      onChange={(e) => setEditForm({ ...editForm, dazhangguiEnterpriseId: e.target.value })}
                      placeholder="用于对接大掌柜订单系统"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.08)',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sales Contact */}
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#3A3A3C', margin: '0 0 12px' }}>
                  销售联系信息
                </h3>
                <p style={{ fontSize: 12, color: '#86868B', margin: '0 0 12px' }}>
                  这些信息将在客户询价时显示
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>销售姓名</label>
                    <input
                      type="text"
                      value={editForm.salesName}
                      onChange={(e) => setEditForm({ ...editForm, salesName: e.target.value })}
                      placeholder="客户专属销售姓名"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.08)',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>销售电话</label>
                      <input
                        type="text"
                        value={editForm.salesPhone}
                        onChange={(e) => setEditForm({ ...editForm, salesPhone: e.target.value })}
                        placeholder="固定电话"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(0,0,0,0.08)',
                          fontSize: 14,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>销售手机</label>
                      <input
                        type="text"
                        value={editForm.salesMobile}
                        onChange={(e) => setEditForm({ ...editForm, salesMobile: e.target.value })}
                        placeholder="手机号码"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(0,0,0,0.08)',
                          fontSize: 14,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#86868B', marginBottom: 4 }}>销售邮箱</label>
                    <input
                      type="email"
                      value={editForm.salesEmail}
                      onChange={(e) => setEditForm({ ...editForm, salesEmail: e.target.value })}
                      placeholder="邮箱地址"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.08)',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: '#fff',
                    color: '#3A3A3C',
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveMember}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#007AFF',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#86868B',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  color: '#1D1D1F'
}
