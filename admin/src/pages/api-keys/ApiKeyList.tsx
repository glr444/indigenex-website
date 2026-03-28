import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  Key,
  Copy,
  Trash2,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { apiKeyApi } from '../../utils/api'

interface ApiKey {
  id: string
  key: string
  name: string
  description?: string
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
}

export default function ApiKeyList() {
  const { t } = useTranslation()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)
  const [copied, setCopied] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiKeyApi.getAll()
      if (response.success) {
        setApiKeys((response.data as ApiKey[]) || [])
      }
    } catch (_err) {
      setError(t('apiKeys.fetchFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiKeyApi.create(formData)
      if (response.success) {
        setShowCreateModal(false)
        setSelectedKey(response.data as ApiKey)
        setShowViewModal(true)
        setFormData({ name: '', description: '' })
        fetchApiKeys()
      }
    } catch (err: any) {
      alert(err.message || t('apiKeys.createFailed'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('apiKeys.confirmDelete'))) return
    try {
      await apiKeyApi.delete(id)
      fetchApiKeys()
    } catch (err) {
      alert(t('apiKeys.deleteFailed'))
    }
  }

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = key
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  // 过滤API Keys
  const filteredKeys = apiKeys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 遮罩显示API Key
  const maskKey = (key: string) => {
    if (key.length <= 8) return '****'
    return key.substring(0, 4) + '****' + key.substring(key.length - 4)
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexShrink: 0
      }}>
        <div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#1D1D1F',
            margin: '0 0 2px',
            letterSpacing: '-0.5px'
          }}>
            {t('apiKeys.title')}
          </h1>
          <p style={{ fontSize: 13, color: '#86868B', margin: 0 }}>
            {t('apiKeys.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#007AFF',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Plus size={14} />
          {t('apiKeys.newKey')}
        </button>
      </div>

      {/* Search */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        flexShrink: 0
      }}>
        <div style={{ position: 'relative' }}>
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
            placeholder={t('apiKeys.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 32px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.08)',
              fontSize: 13,
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007AFF'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'auto',
        flex: 1,
        minHeight: 0
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F5F7' }}>
              <th style={thStyle}>{t('apiKeys.name')}</th>
              <th style={thStyle}>{t('apiKeys.key')}</th>
              <th style={thStyle}>{t('apiKeys.status')}</th>
              <th style={thStyle}>{t('apiKeys.lastUsed')}</th>
              <th style={thStyle}>{t('apiKeys.createdAt')}</th>
              <th style={{ ...thStyle, width: 100 }}>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ color: '#86868B', fontSize: 14 }}>{t('common.loading')}</div>
                </td>
              </tr>
            ) : filteredKeys.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                  <Key size={40} style={{ color: '#C7C7CC', marginBottom: 12 }} />
                  <div style={{ color: '#86868B', fontSize: 14 }}>{t('apiKeys.noData')}</div>
                </td>
              </tr>
            ) : (
              filteredKeys.map((apiKey) => (
                <tr
                  key={apiKey.id}
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, color: '#1D1D1F' }}>
                      {apiKey.name}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: '#86868B'
                    }}>
                      <Key size={14} />
                      {maskKey(apiKey.key)}
                      <button
                        onClick={() => handleCopy(apiKey.key)}
                        style={{
                          padding: 4,
                          borderRadius: 4,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#007AFF',
                          transition: 'background 0.15s ease'
                        }}
                        title={t('apiKeys.copy')}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: apiKey.isActive ? '#34C75915' : '#FF3B3015',
                      color: apiKey.isActive ? '#34C759' : '#FF3B30'
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: apiKey.isActive ? '#34C759' : '#FF3B30'
                      }} />
                      {apiKey.isActive ? t('apiKeys.active') : t('apiKeys.inactive')}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} style={{ color: '#86868B' }} />
                      <span>{formatDate(apiKey.lastUsedAt)}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {formatDate(apiKey.createdAt)}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleDelete(apiKey.id)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#FF3B30',
                          transition: 'background 0.15s ease'
                        }}
                        title={t('common.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={() => setShowCreateModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>
              {t('apiKeys.createTitle')}
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  {t('apiKeys.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('apiKeys.namePlaceholder')}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  {t('apiKeys.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('apiKeys.descriptionPlaceholder')}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: '#fff',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#007AFF',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Key Modal (仅创建后显示一次) */}
      {showViewModal && selectedKey && (
        <div style={modalOverlayStyle} onClick={() => setShowViewModal(false)}>
          <div style={{ ...modalContentStyle, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#34C75915',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Key size={24} style={{ color: '#34C759' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>
              {t('apiKeys.createdSuccess')}
            </h2>
            <p style={{ fontSize: 14, color: '#86868B', margin: '0 0 20px' }}>
              {t('apiKeys.createdDesc')}
            </p>

            {/* API Key 显示区域 */}
            <div style={{
              background: '#F5F5F7',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: 14,
                wordBreak: 'break-all',
                color: '#1D1D1F',
                marginBottom: 12,
                userSelect: 'all'
              }}>
                {selectedKey.key}
              </div>
              <button
                onClick={() => handleCopy(selectedKey.key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: copied ? '#34C759' : '#fff',
                  color: copied ? '#fff' : '#007AFF',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t('apiKeys.copied') : t('apiKeys.copyKey')}
              </button>
            </div>

            {/* 安全提示 */}
            <div style={{
              background: '#FFF3E0',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              gap: 10,
              marginBottom: 20
            }}>
              <AlertTriangle size={20} style={{ color: '#FF9500', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#FF9500', marginBottom: 4 }}>
                  {t('apiKeys.securityWarning')}
                </div>
                <div style={{ fontSize: 12, color: '#FF9500', opacity: 0.8 }}>
                  {t('apiKeys.securityDesc')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                background: '#007AFF',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {t('common.confirm')}
            </button>
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
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap'
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  color: '#1D1D1F',
  whiteSpace: 'nowrap'
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20
}

const modalContentStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 24,
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
}
