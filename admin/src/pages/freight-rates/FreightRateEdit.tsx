import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  X,
  Save,
  Ship,
  Plane,
  Truck,
  TrainFront,
  DollarSign,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { freightRateApi } from '../../utils/api'

interface FormData {
  originPort: string
  destinationPort: string
  viaPort: string
  transportMode: 'SEA' | 'AIR' | 'LAND' | 'RAIL'
  validFrom: string
  validTo: string
  price20GP: string
  price40GP: string
  price40HQ: string
  priceLCL: string
  currency: string
  carrier: string
  transitTime: string
  surcharges: { name: string; amount: string; unit: string }[]
  remarks: string
  status: 'ACTIVE' | 'DRAFT' | 'SUSPENDED'
}

const initialFormData: FormData = {
  originPort: '',
  destinationPort: '',
  viaPort: '',
  transportMode: 'SEA',
  validFrom: '',
  validTo: '',
  price20GP: '',
  price40GP: '',
  price40HQ: '',
  priceLCL: '',
  currency: 'USD',
  carrier: '',
  transitTime: '',
  surcharges: [],
  remarks: '',
  status: 'DRAFT'
}

interface SlideOverPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  onSave?: () => void
  saving?: boolean
}

// 右侧划入卡片组件
function SlideOverPanel({ isOpen, onClose, title, subtitle, children, onSave, saving }: SlideOverPanelProps) {
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
        width: 'min(560px, 100vw)',
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
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#1D1D1F',
              margin: '0 0 4px',
              letterSpacing: '-0.3px'
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 14, color: '#86868B', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
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

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: 24
        }}>
          {children}
        </div>

        {/* Footer */}
        {onSave && (
          <div style={{
            padding: '16px 24px',
            background: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            flexShrink: 0
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                background: '#fff',
                color: '#3A3A3C',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              取消
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                background: '#007AFF',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              <Save size={18} />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FreightRateEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  // useTranslation hook removed - not needed for this component
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchRate = useCallback(async () => {
    if (!id) return
    try {
      const response = await freightRateApi.getById(id)
      if (response.success && response.data) {
        const rateData = response.data as { rate?: any }
        const rate = rateData.rate || response.data as any
        setFormData({
          originPort: rate.originPort || '',
          destinationPort: rate.destinationPort || '',
          viaPort: rate.viaPort || '',
          transportMode: rate.transportMode || 'SEA',
          validFrom: rate.validFrom ? rate.validFrom.split('T')[0] : '',
          validTo: rate.validTo ? rate.validTo.split('T')[0] : '',
          price20GP: rate.price20GP?.toString() || '',
          price40GP: rate.price40GP?.toString() || '',
          price40HQ: rate.price40HQ?.toString() || '',
          priceLCL: rate.priceLCL?.toString() || '',
          currency: rate.currency || 'USD',
          carrier: rate.carrier || '',
          transitTime: rate.transitTime?.toString() || '',
          surcharges: rate.surcharges?.map((s: any) => ({
            name: s.name,
            amount: s.amount.toString(),
            unit: s.unit || 'per_container'
          })) || [],
          remarks: rate.remarks || '',
          status: rate.status || 'DRAFT'
        })
      }
    } catch (err: any) {
      setError(err.message || '获取运价信息失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (isEditing && id) {
      fetchRate()
    }
  }, [isEditing, id, fetchRate])

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const payload = {
        ...formData,
        price20GP: formData.price20GP ? parseFloat(formData.price20GP) : null,
        price40GP: formData.price40GP ? parseFloat(formData.price40GP) : null,
        price40HQ: formData.price40HQ ? parseFloat(formData.price40HQ) : null,
        priceLCL: formData.priceLCL ? parseFloat(formData.priceLCL) : null,
        transitTime: formData.transitTime ? parseInt(formData.transitTime) : null,
        surcharges: formData.surcharges
          .filter(s => s.name && s.amount)
          .map(s => ({
            name: s.name,
            amount: parseFloat(s.amount),
            unit: s.unit
          }))
      }

      if (isEditing && id) {
        await freightRateApi.update(id, payload)
      } else {
        await freightRateApi.create(payload)
      }
      navigate('/freight-rates')
    } catch (err: any) {
      setError(err.message || '保存失败')
      setSaving(false)
    }
  }

  const addSurcharge = () => {
    setFormData(prev => ({
      ...prev,
      surcharges: [...prev.surcharges, { name: '', amount: '', unit: 'per_container' }]
    }))
  }

  const removeSurcharge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      surcharges: prev.surcharges.filter((_, i) => i !== index)
    }))
  }

  const updateSurcharge = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      surcharges: prev.surcharges.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      )
    }))
  }

  const transportModes = [
    { value: 'SEA', label: '海运', icon: Ship, color: '#34C759' },
    { value: 'AIR', label: '空运', icon: Plane, color: '#007AFF' },
    { value: 'LAND', label: '陆运', icon: Truck, color: '#FF9500' },
    { value: 'RAIL', label: '铁路', icon: TrainFront, color: '#AF52DE' }
  ]

  return (
    <SlideOverPanel
      isOpen={true}
      onClose={() => navigate('/freight-rates')}
      title={isEditing ? '编辑运价' : '新建运价'}
      subtitle={isEditing ? '修改运价信息' : '添加新的运价记录'}
      onSave={handleSave}
      saving={saving}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ color: '#86868B', fontSize: 14 }}>加载中...</div>
        </div>
      ) : (
        <>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 10,
              background: '#FFE5E5',
              color: '#FF3B30',
              fontSize: 14,
              marginBottom: 20
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Transport Mode Selection */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#1D1D1F',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              运输方式
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {transportModes.map((mode) => {
                const Icon = mode.icon
                const selected = formData.transportMode === mode.value
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, transportMode: mode.value as any }))}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      padding: '12px 8px',
                      borderRadius: 10,
                      border: `2px solid ${selected ? mode.color : 'transparent'}`,
                      background: selected ? `${mode.color}10` : '#F5F5F7',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={20} style={{ color: selected ? mode.color : '#86868B' }} />
                    <span style={{
                      fontSize: 12,
                      fontWeight: selected ? 600 : 500,
                      color: selected ? mode.color : '#3A3A3C'
                    }}>
                      {mode.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Route Information */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#1D1D1F',
              margin: '0 0 16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              航线信息
            </h3>

            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 8, alignItems: 'center' }}>
                <div>
                  <label style={labelStyle}>起运港 (POL) *</label>
                  <input
                    type="text"
                    required
                    value={formData.originPort}
                    onChange={(e) => setFormData(prev => ({ ...prev, originPort: e.target.value }))}
                    placeholder="例如：上海"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
                  <ChevronRight size={20} style={{ color: '#C7C7CC' }} />
                </div>
                <div>
                  <label style={labelStyle}>目的港 (POD) *</label>
                  <input
                    type="text"
                    required
                    value={formData.destinationPort}
                    onChange={(e) => setFormData(prev => ({ ...prev, destinationPort: e.target.value }))}
                    placeholder="例如：洛杉矶"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>中转港 (Via)</label>
                  <input
                    type="text"
                    value={formData.viaPort}
                    onChange={(e) => setFormData(prev => ({ ...prev, viaPort: e.target.value }))}
                    placeholder="可选"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>航程（天）</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.transitTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, transitTime: e.target.value }))}
                    placeholder="例如：15"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>船公司 / 承运人</label>
                <input
                  type="text"
                  value={formData.carrier}
                  onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
                  placeholder="例如：COSCO"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label style={labelStyle}>生效日期 *</label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>到期日期 *</label>
                  <input
                    type="date"
                    required
                    value={formData.validTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1D1D1F',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                运价信息
              </h3>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: 13,
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div>
                <label style={labelStyle}>20GP</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#86868B' }} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price20GP}
                    onChange={(e) => setFormData(prev => ({ ...prev, price20GP: e.target.value }))}
                    placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: 36 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>40GP</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#86868B' }} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price40GP}
                    onChange={(e) => setFormData(prev => ({ ...prev, price40GP: e.target.value }))}
                    placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: 36 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>40HQ</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#86868B' }} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price40HQ}
                    onChange={(e) => setFormData(prev => ({ ...prev, price40HQ: e.target.value }))}
                    placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: 36 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>LCL (每立方)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#86868B' }} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.priceLCL}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceLCL: e.target.value }))}
                    placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: 36 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Surcharges */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1D1D1F',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                附加费
              </h3>
              <button
                type="button"
                onClick={addSurcharge}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #007AFF',
                  background: 'transparent',
                  color: '#007AFF',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                + 添加
              </button>
            </div>

            {formData.surcharges.length === 0 ? (
              <div style={{
                padding: 24,
                textAlign: 'center',
                color: '#86868B',
                fontSize: 14,
                background: '#F5F5F7',
                borderRadius: 10
              }}>
                暂无附加费
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {formData.surcharges.map((surcharge, index) => (
                  <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, fontSize: 11 }}>名称</label>
                      <input
                        type="text"
                        value={surcharge.name}
                        onChange={(e) => updateSurcharge(index, 'name', e.target.value)}
                        placeholder="ORC"
                        style={{ ...inputStyle, fontSize: 13 }}
                      />
                    </div>
                    <div style={{ width: 100 }}>
                      <label style={{ ...labelStyle, fontSize: 11 }}>金额</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={surcharge.amount}
                        onChange={(e) => updateSurcharge(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        style={{ ...inputStyle, fontSize: 13 }}
                      />
                    </div>
                    <div style={{ width: 100 }}>
                      <label style={{ ...labelStyle, fontSize: 11 }}>单位</label>
                      <select
                        value={surcharge.unit}
                        onChange={(e) => updateSurcharge(index, 'unit', e.target.value)}
                        style={{ ...inputStyle, fontSize: 13 }}
                      >
                        <option value="per_container">每柜</option>
                        <option value="per_ton">每吨</option>
                        <option value="per_cbm">每立方</option>
                        <option value="per_bl">每票</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSurcharge(index)}
                      style={{
                        padding: '8px',
                        borderRadius: 8,
                        border: '1px solid #FF3B30',
                        background: 'transparent',
                        color: '#FF3B30',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remarks & Status */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>备注</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="添加备注信息..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              />
            </div>

            <div>
              <label style={labelStyle}>状态</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'DRAFT', label: '草稿', color: '#FF9500' },
                  { value: 'ACTIVE', label: '生效', color: '#34C759' },
                  { value: 'SUSPENDED', label: '暂停', color: '#8E8E93' }
                ].map((status) => (
                  <label
                    key={status.value}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `2px solid ${formData.status === status.value ? status.color : 'transparent'}`,
                      background: formData.status === status.value ? `${status.color}10` : '#F5F5F7',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={formData.status === status.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: status.color
                    }} />
                    <span style={{
                      fontSize: 13,
                      fontWeight: formData.status === status.value ? 600 : 500,
                      color: formData.status === status.value ? status.color : '#3A3A3C'
                    }}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </SlideOverPanel>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#3A3A3C',
  marginBottom: 4
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.08)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxSizing: 'border-box',
  background: '#fff'
}
