import { useEffect, useState, useRef } from 'react'
import { Plus, Search, Upload, Download, Trash2, Edit2, AlertCircle, CheckCircle, X, Anchor } from 'lucide-react'
import { request } from '../../utils/api'

interface Port {
  id: string
  code: string
  nameEn: string
  nameCn: string
  countryCode: string | null
  countryName: string | null
  region: string | null
  isActive: boolean
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function PortList() {
  const [ports, setPorts] = useState<Port[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [selectedPort, setSelectedPort] = useState<Port | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importData, setImportData] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{success: number, failed: number} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPorts()
  }, [pagination.page])

  const fetchPorts = async () => {
    try {
      setLoading(true)
      const response = await request<{ports: Port[], pagination: Pagination}>(`/admin/ports?page=${pagination.page}&limit=${pagination.limit}&search=${searchTerm}`)
      if (response.success) {
        setPorts(response.data!.ports)
        setPagination(response.data!.pagination)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ports')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchPorts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this port?')) return

    try {
      await request(`/admin/ports/${id}`, { method: 'DELETE' })
      fetchPorts()
    } catch (err: any) {
      setError(err.message || 'Failed to delete port')
    }
  }

  const handleSavePort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPort) return

    try {
      if (selectedPort.id) {
        await request(`/admin/ports/${selectedPort.id}`, {
          method: 'PUT',
          body: JSON.stringify(selectedPort)
        })
      } else {
        await request('/admin/ports', {
          method: 'POST',
          body: JSON.stringify(selectedPort)
        })
      }
      setIsEditModalOpen(false)
      setSelectedPort(null)
      fetchPorts()
    } catch (err: any) {
      setError(err.message || 'Failed to save port')
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) return

    setImportLoading(true)
    try {
      const lines = importData.trim().split('\n')
      const ports = lines.map(line => {
        const parts = line.split('\t').map(p => p.trim())
        return {
          code: parts[0] || '',
          nameEn: parts[1] || '',
          nameCn: parts[2] || '',
          countryCode: parts[3] || '',
          countryName: parts[4] || '',
          region: parts[5] || ''
        }
      }).filter(p => p.code && p.nameEn && p.nameCn)

      const response = await request<{success: number, failed: number}>('/admin/ports/import', {
        method: 'POST',
        body: JSON.stringify({ ports })
      })
      if (response.success) {
        setImportResult(response.data!)
        fetchPorts()
        setTimeout(() => {
          setIsImportModalOpen(false)
          setImportData('')
          setImportResult(null)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import ports')
    } finally {
      setImportLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const template = 'Code\tName (EN)\tName (CN)\tCountry Code\tCountry Name\tRegion\nSHA\tShanghai\t上海\tCN\tChina\tAsia\nLAX\tLos Angeles\t洛杉矶\tUS\tUSA\tNorth America'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'port_template.tsv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.3px', marginBottom: 8 }}>
          Port Management
        </h1>
        <p style={{ color: '#86868B', fontSize: 15 }}>
          Manage port data for freight rate queries
        </p>
      </div>

      {/* Search and Actions */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: '16px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: 20,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#86868B' }} />
          <input
            type="text"
            placeholder="Search by code, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.08)',
              fontSize: 14,
              background: '#F5F5F7',
              outline: 'none'
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            fontWeight: 500,
            fontSize: 14,
            color: '#fff',
            background: '#007AFF',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            fontWeight: 500,
            fontSize: 14,
            color: '#3A3A3C',
            background: '#F5F5F7',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Upload size={16} />
          Import
        </button>
        <button
          onClick={() => {
            setSelectedPort({ id: '', code: '', nameEn: '', nameCn: '', countryCode: '', countryName: '', region: '', isActive: true, createdAt: '' })
            setIsEditModalOpen(true)
          }}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            fontWeight: 500,
            fontSize: 14,
            color: '#fff',
            background: '#34C759',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Plus size={16} />
          Add Port
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 16,
          padding: '12px 16px',
          borderRadius: 10,
          background: '#FFE5E5',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#FF3B30',
          fontSize: 14
        }}>
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '2px solid #E5E5EA', borderTopColor: '#007AFF', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#86868B', fontSize: 14 }}>Loading...</p>
          </div>
        ) : ports.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Anchor size={48} style={{ color: '#C7C7CC', margin: '0 auto 16px' }} />
            <p style={{ color: '#86868B', fontSize: 16 }}>No ports found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F5F7' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase' }}>Code</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase' }}>Name (EN)</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase' }}>Name (CN)</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase' }}>Country</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase' }}>Region</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#86868B', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ports.map((port, index) => (
                <tr key={port.id} style={{ borderTop: index > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#007AFF', background: 'rgba(0,122,255,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                      {port.code}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#1D1D1F' }}>{port.nameEn}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#1D1D1F' }}>{port.nameCn}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#86868B' }}>
                    {port.countryCode && (
                      <span style={{ fontFamily: 'monospace', marginRight: 4 }}>{port.countryCode}</span>
                    )}
                    {port.countryName}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#86868B' }}>{port.region || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 500,
                      background: port.isActive ? '#E8F5E9' : '#FFEBEE',
                      color: port.isActive ? '#34C759' : '#FF3B30'
                    }}>
                      {port.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setSelectedPort(port)
                        setIsEditModalOpen(true)
                      }}
                      style={{ padding: 5, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#007AFF', marginRight: 2 }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(port.id)}
                      style={{ padding: 5, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#FF3B30' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#86868B' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#fff',
                  fontSize: 14,
                  color: pagination.page === 1 ? '#C7C7CC' : '#3A3A3C',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#fff',
                  fontSize: 14,
                  color: pagination.page === pagination.totalPages ? '#C7C7CC' : '#3A3A3C',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedPort && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 480
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1D1D1F', marginBottom: 20 }}>
              {selectedPort.id ? 'Edit Port' : 'Add Port'}
            </h3>
            <form onSubmit={handleSavePort} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3A3A3C', marginBottom: 6 }}>Port Code *</label>
                <input
                  type="text"
                  value={selectedPort.code}
                  onChange={(e) => setSelectedPort({ ...selectedPort, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SHA"
                  required
                  disabled={!!selectedPort.id}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: 14,
                    background: selectedPort.id ? '#F5F5F7' : '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3A3A3C', marginBottom: 6 }}>Name (English) *</label>
                <input
                  type="text"
                  value={selectedPort.nameEn}
                  onChange={(e) => setSelectedPort({ ...selectedPort, nameEn: e.target.value })}
                  placeholder="e.g., Shanghai"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3A3A3C', marginBottom: 6 }}>Name (Chinese) *</label>
                <input
                  type="text"
                  value={selectedPort.nameCn}
                  onChange={(e) => setSelectedPort({ ...selectedPort, nameCn: e.target.value })}
                  placeholder="e.g., 上海"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: 14
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3A3A3C', marginBottom: 6 }}>Country Code</label>
                  <input
                    type="text"
                    value={selectedPort.countryCode || ''}
                    onChange={(e) => setSelectedPort({ ...selectedPort, countryCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., CN"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3A3A3C', marginBottom: 6 }}>Country Name</label>
                  <input
                    type="text"
                    value={selectedPort.countryName || ''}
                    onChange={(e) => setSelectedPort({ ...selectedPort, countryName: e.target.value })}
                    placeholder="e.g., China"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontSize: 14
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3A3A3C', marginBottom: 6 }}>Region</label>
                <select
                  value={selectedPort.region || ''}
                  onChange={(e) => setSelectedPort({ ...selectedPort, region: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: 14,
                    background: '#fff'
                  }}
                >
                  <option value="">Select Region</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                  <option value="Middle East">Middle East</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedPort(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: '#fff',
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#3A3A3C',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#007AFF',
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 560
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>
              Batch Import Ports
            </h3>
            <p style={{ fontSize: 14, color: '#86868B', marginBottom: 16 }}>
              Paste data or upload a TSV file. Format: Code | Name (EN) | Name (CN) | Country Code | Country Name | Region
            </p>

            {importResult ? (
              <div style={{
                padding: 24,
                borderRadius: 12,
                background: '#E8F5E9',
                textAlign: 'center'
              }}>
                <CheckCircle size={48} style={{ color: '#34C759', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 16, fontWeight: 500, color: '#1D1D1F' }}>
                  Import completed!
                </p>
                <p style={{ fontSize: 14, color: '#86868B', marginTop: 4 }}>
                  Success: {importResult.success} | Failed: {importResult.failed}
                </p>
              </div>
            ) : (
              <>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={`SHA\tShanghai\t上海\tCN\tChina\tAsia
LAX\tLos Angeles\t洛杉矶\tUS\tUSA\tNorth America`}
                  rows={8}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".tsv,.txt,.csv"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: '#fff',
                      fontSize: 14,
                      color: '#3A3A3C',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Upload size={16} />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: '#fff',
                      fontSize: 14,
                      color: '#3A3A3C',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Download size={16} />
                    Download Template
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalOpen(false)
                      setImportData('')
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: '#fff',
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#3A3A3C',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={!importData.trim() || importLoading}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: 10,
                      border: 'none',
                      background: importData.trim() ? '#007AFF' : '#C7C7CC',
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#fff',
                      cursor: importData.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {importLoading ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
