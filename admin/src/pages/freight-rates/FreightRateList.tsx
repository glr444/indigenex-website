import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  Filter,
  Upload,
  Edit2,
  Trash2,
  Ship,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar
} from 'lucide-react'
import { freightRateApi } from '../../utils/api'

interface FreightRate {
  id: string
  route: string | null
  originPort: string
  originPortEn: string | null
  destinationPort: string
  destinationPortEn: string | null
  viaPort: string | null
  viaPortEn: string | null
  portArea: string | null
  validFrom: string
  validTo: string
  validityType: string
  isRecommended: boolean
  price20GP: number | null
  price40GP: number | null
  price40HQ: number | null
  price45HQ: number | null
  currency: string
  cost20GP: number | null
  cost40GP: number | null
  cost40HQ: number | null
  cost45HQ: number | null
  isAllIn: boolean
  carrier: string | null
  carrierLogo: string | null
  transitTime: number | null
  schedule: string | null
  routeCode: string | null
  vesselName: string | null
  voyage: string | null
  sailingDate: string | null
  estimatedDeparture: string | null
  bookingAgent: string | null
  bookingLink: string | null
  spaceStatus: string
  docCutoffDay: string | null
  docCutoffTime: string | null
  billOfLadingType: string | null
  shippingTerms: string | null
  surcharges: string | null
  weightLimit: string | null
  priceTrend: string | null
  contactInfo: string | null
  remarks: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export default function FreightRateList() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [rates, setRates] = useState<FreightRate[]>([])
  const [loading, setLoading] = useState(true)
  const [, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSpaceStatus, setFilterSpaceStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [showFilters, setShowFilters] = useState(false)

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus) params.append('status', filterStatus)
      if (filterSpaceStatus) params.append('spaceStatus', filterSpaceStatus)
      params.append('page', currentPage.toString())
      params.append('limit', pageSize.toString())

      const response = await freightRateApi.getAll(params.toString())
      if (response.success) {
        const data = response.data as any
        setRates(data.rates || [])
        const pagination = data.pagination || {}
        const total = pagination.total || 0
        setTotalCount(total)
        setTotalPages(pagination.totalPages || Math.ceil(total / pageSize) || 1)
      }
    } catch (_err) {
      setError(t('freightRates.fetchFailed'))
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterStatus, filterSpaceStatus, currentPage, pageSize, t])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  const handleDelete = async (id: string) => {
    if (!confirm(t('freightRates.confirmDelete'))) return
    try {
      await freightRateApi.delete(id)
      fetchRates()
    } catch (err) {
      alert(t('freightRates.deleteFailed'))
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await freightRateApi.import(formData)
      if (response.success && response.data) {
        const data = response.data as any
        alert(t('freightRates.importSuccess', { count: data.imported || data.success || 0 }))
        fetchRates()
      }
    } catch (err: any) {
      alert(t('freightRates.importFailed'))
    }
    e.target.value = ''
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#34C759'
      case 'EXPIRED': return '#FF3B30'
      case 'INACTIVE': return '#FF9500'
      default: return '#8E8E93'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return t('freightRates.active')
      case 'EXPIRED': return t('freightRates.expired')
      case 'INACTIVE': return t('freightRates.inactive')
      default: return status
    }
  }

  const getSpaceStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#34C759'
      case 'LIMITED': return '#FF9500'
      case 'FULL': return '#FF3B30'
      case 'SUSPENDED': return '#8E8E93'
      default: return '#8E8E93'
    }
  }

  const getSpaceStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return t('freightRates.spaceAvailable')
      case 'LIMITED': return t('freightRates.spaceLimited')
      case 'FULL': return t('freightRates.spaceFull')
      case 'SUSPENDED': return t('freightRates.spaceSuspended')
      default: return status
    }
  }

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (price === null || price === undefined) return '-'
    return `${currency} ${price.toLocaleString()}`
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US')
  }

  // 生成分页按钮数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexShrink: 0
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#1D1D1F',
            margin: '0 0 4px',
            letterSpacing: '-0.5px'
          }}>
            {t('freightRates.title')}
          </h1>
          <p style={{ fontSize: 14, color: '#86868B', margin: 0 }}>
            {t('freightRates.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            color: '#3A3A3C',
            transition: 'all 0.15s ease'
          }}>
            <Upload size={16} />
            {t('freightRates.bulkImport')}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={() => navigate('/freight-rates/new')}
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
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            {t('freightRates.newRate')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        flexShrink: 0
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
              placeholder={t('freightRates.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007AFF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.08)',
              background: showFilters ? 'rgba(0,122,255,0.08)' : '#fff',
              color: showFilters ? '#007AFF' : '#3A3A3C',
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Filter size={16} />
            {t('common.filter')}
          </button>
        </div>

        {showFilters && (
          <div style={{
            display: 'flex',
            gap: 12,
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid rgba(0,0,0,0.06)'
          }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 14,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">{t('freightRates.allStatus')}</option>
              <option value="ACTIVE">{t('freightRates.active')}</option>
              <option value="INACTIVE">{t('freightRates.inactive')}</option>
              <option value="EXPIRED">{t('freightRates.expired')}</option>
            </select>
            <select
              value={filterSpaceStatus}
              onChange={(e) => setFilterSpaceStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 14,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">{t('freightRates.allSpaceStatus')}</option>
              <option value="AVAILABLE">{t('freightRates.spaceAvailable')}</option>
              <option value="LIMITED">{t('freightRates.spaceLimited')}</option>
              <option value="FULL">{t('freightRates.spaceFull')}</option>
              <option value="SUSPENDED">{t('freightRates.spaceSuspended')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'auto',
        flex: 1,
        minHeight: 0
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1400 }}>
          <thead>
            <tr style={{ background: '#F5F5F7' }}>
              <th style={thStyle}>{t('freightRates.route')}</th>
              <th style={thStyle}>{t('freightRates.originPort')}</th>
              <th style={thStyle}>{t('freightRates.destinationPort')}</th>
              <th style={thStyle}>{t('freightRates.viaPort')}</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>{t('freightRates.price20GP')}</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>{t('freightRates.price40GP')}</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>{t('freightRates.price40HQ')}</th>
              <th style={thStyle}>{t('freightRates.carrier')}</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>{t('freightRates.transitTime')}</th>
              <th style={thStyle}>{t('freightRates.validity')}</th>
              <th style={thStyle}>{t('freightRates.spaceStatus')}</th>
              <th style={thStyle}>{t('freightRates.status')}</th>
              <th style={{ ...thStyle, width: 100 }}>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={13} style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ color: '#86868B', fontSize: 14 }}>{t('common.loading')}</div>
                </td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ padding: 60, textAlign: 'center' }}>
                  <Ship size={40} style={{ color: '#C7C7CC', marginBottom: 12 }} />
                  <div style={{ color: '#86868B', fontSize: 14 }}>{t('freightRates.noData')}</div>
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr
                  key={rate.id}
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {rate.isRecommended && (
                        <Star size={14} style={{ color: '#FF9500', fill: '#FF9500' }} />
                      )}
                      <span style={{ fontWeight: 500, color: '#1D1D1F' }}>
                        {rate.route || '-'}
                      </span>
                    </div>
                    {rate.routeCode && (
                      <div style={{ fontSize: 12, color: '#86868B', marginTop: 2 }}>
                        {rate.routeCode}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, color: '#1D1D1F' }}>
                      {rate.originPort}
                    </div>
                    {rate.portArea && (
                      <div style={{ fontSize: 12, color: '#86868B' }}>
                        {rate.portArea}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, color: '#1D1D1F' }}>
                      {rate.destinationPort}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 14, color: rate.viaPort ? '#3A3A3C' : '#C7C7CC' }}>
                      {rate.viaPort || '-'}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: rate.price20GP ? '#1D1D1F' : '#C7C7CC' }}>
                      {formatPrice(rate.price20GP, rate.currency)}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: rate.price40GP ? '#1D1D1F' : '#C7C7CC' }}>
                      {formatPrice(rate.price40GP, rate.currency)}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: rate.price40HQ ? '#1D1D1F' : '#C7C7CC' }}>
                      {formatPrice(rate.price40HQ, rate.currency)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 14, color: '#3A3A3C' }}>
                      {rate.carrier || '-'}
                    </div>
                    {rate.vesselName && (
                      <div style={{ fontSize: 12, color: '#86868B' }}>
                        {rate.vesselName}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: rate.transitTime ? '#3A3A3C' : '#C7C7CC' }}>
                      {rate.transitTime ? `${rate.transitTime}d` : '-'}
                    </div>
                    {rate.schedule && (
                      <div style={{ fontSize: 11, color: '#86868B' }}>
                        {rate.schedule}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#3A3A3C' }}>
                      <Calendar size={12} />
                      {formatDate(rate.validFrom)} - {formatDate(rate.validTo)}
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
                      background: `${getSpaceStatusColor(rate.spaceStatus)}15`,
                      color: getSpaceStatusColor(rate.spaceStatus)
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: getSpaceStatusColor(rate.spaceStatus)
                      }} />
                      {getSpaceStatusText(rate.spaceStatus)}
                    </span>
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
                      background: `${getStatusColor(rate.status)}15`,
                      color: getStatusColor(rate.status)
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: getStatusColor(rate.status)
                      }} />
                      {getStatusText(rate.status)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/freight-rates/edit/${rate.id}`)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#007AFF',
                          transition: 'background 0.15s ease'
                        }}
                        title={t('common.edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rate.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
          padding: '12px 16px',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          flexShrink: 0
        }}>
          <div style={{ fontSize: 13, color: '#86868B' }}>
            {t('freightRates.totalRecords', { count: totalCount })},{t('freightRates.perPage')}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              style={{
                margin: '0 8px',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 13,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            {t('freightRates.page')} {currentPage}/{totalPages} {t('freightRates.page')}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={paginationButtonStyle(currentPage === 1)}
            >
              {t('freightRates.firstPage')}
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={paginationButtonStyle(currentPage === 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={page === '...'}
                style={{
                  minWidth: 32,
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 6,
                  border: 'none',
                  background: page === currentPage ? '#007AFF' : '#F5F5F7',
                  color: page === currentPage ? '#fff' : page === '...' ? '#86868B' : '#3A3A3C',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: page === '...' ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={paginationButtonStyle(currentPage === totalPages)}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={paginationButtonStyle(currentPage === totalPages)}
            >
              {t('freightRates.lastPage')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#86868B',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap'
}

const tdStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: 14,
  color: '#1D1D1F',
  whiteSpace: 'nowrap'
}

const paginationButtonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 6,
  border: 'none',
  background: disabled ? '#F5F5F7' : '#fff',
  color: disabled ? '#C7C7CC' : '#3A3A3C',
  fontSize: 13,
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
})
