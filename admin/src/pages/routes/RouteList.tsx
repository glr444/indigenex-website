import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin
} from 'lucide-react'
import { routeApi } from '../../utils/api'

interface Route {
  id: string
  code: string
  nameEn: string
  nameCn: string
  description: string | null
  regionFrom: string | null
  regionTo: string | null
  isActive: boolean
  createdAt: string
}

export default function RouteList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage] = useState(1)

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', currentPage.toString())

      const response = await routeApi.getAll(params.toString())
      if (response.success) {
        const data = response.data as any
        setRoutes(data.routes || [])
      }
    } catch (err) {
      console.error('Failed to fetch routes:', err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, currentPage])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      await routeApi.delete(id)
      fetchRoutes()
    } catch (err) {
      alert(t('common.deleteFailed'))
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#1D1D1F',
            margin: '0 0 4px',
            letterSpacing: '-0.5px'
          }}>
            {t('nav.routes')}
          </h1>
          <p style={{ fontSize: 14, color: '#86868B', margin: 0 }}>
            {t('routes.subtitle')}
          </p>
        </div>
        <button
          onClick={() => navigate('/routes/new')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#007AFF',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          {t('routes.newRoute')}
        </button>
      </div>

      {/* Search */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#86868B'
              }}
            />
            <input
              type="text"
              placeholder={t('routes.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'auto',
        flex: 1
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F5F7' }}>
              <th style={thStyle}>{t('routes.code')}</th>
              <th style={thStyle}>{t('routes.nameEn')}</th>
              <th style={thStyle}>{t('routes.nameCn')}</th>
              <th style={thStyle}>{t('routes.region')}</th>
              <th style={thStyle}>{t('routes.status')}</th>
              <th style={{ ...thStyle, width: 100 }}>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ color: '#86868B' }}>{t('common.loading')}</div>
                </td>
              </tr>
            ) : routes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                  <MapPin size={40} style={{ color: '#C7C7CC', marginBottom: 12 }} />
                  <div style={{ color: '#86868B' }}>{t('routes.noData')}</div>
                </td>
              </tr>
            ) : (
              routes.map((route) => (
                <tr key={route.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 500, color: '#1D1D1F' }}>{route.code}</span>
                  </td>
                  <td style={tdStyle}>{route.nameEn}</td>
                  <td style={tdStyle}>{route.nameCn}</td>
                  <td style={tdStyle}>
                    {route.regionFrom && route.regionTo
                      ? `${route.regionFrom} → ${route.regionTo}`
                      : '-'}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: route.isActive ? '#E8F5E9' : '#F5F5F7',
                      color: route.isActive ? '#2E7D32' : '#86868B'
                    }}>
                      {route.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/routes/edit/${route.id}`)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#007AFF'
                        }}
                        title={t('common.edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(route.id)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#FF3B30'
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
