import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  X,
  Save,
  Ship,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Star,
  Calendar,
  Anchor,
  Clock,
  FileText,
  User,
  TrendingUp,
  Package,
  MapPin
} from 'lucide-react'
import { freightRateApi } from '../../utils/api'

interface Surcharge {
  name: string
  amount: string
  unit: string
}

interface FormData {
  // 基本信息
  route: string
  routeCode: string
  originPort: string
  originPortEn: string
  destinationPort: string
  destinationPortEn: string
  viaPort: string
  viaPortEn: string
  portArea: string

  // 有效期
  validFrom: string
  validTo: string
  validityType: 'LONG' | 'SHORT'
  isRecommended: boolean

  // 船公司
  carrier: string
  carrierLogo: string

  // 运价
  price20GP: string
  price40GP: string
  price40HQ: string
  price45HQ: string
  currency: string

  // 成本
  cost20GP: string
  cost40GP: string
  cost40HQ: string
  cost45HQ: string
  isAllIn: boolean

  // 航程
  transitTime: string
  schedule: string

  // 船期
  vesselName: string
  voyage: string
  sailingDate: string
  estimatedDeparture: string

  // 订舱
  bookingAgent: string
  bookingLink: string
  spaceStatus: 'AVAILABLE' | 'LIMITED' | 'FULL' | 'SUSPENDED'

  // 文件截止
  docCutoffDay: string
  docCutoffTime: string

  // 提单
  billOfLadingType: string
  shippingTerms: string
  deliveryGuide: string

  // 附加费
  surcharges: Surcharge[]
  weightLimit: string

  // 其他
  priceTrend: 'UP' | 'DOWN' | 'STABLE' | ''
  contactInfo: string
  receiptGuide: string
  remarks: string

  // 状态
  status: 'ACTIVE' | 'INACTIVE'
}

const initialFormData: FormData = {
  route: '',
  routeCode: '',
  originPort: '',
  originPortEn: '',
  destinationPort: '',
  destinationPortEn: '',
  viaPort: '',
  viaPortEn: '',
  portArea: '',

  validFrom: '',
  validTo: '',
  validityType: 'LONG',
  isRecommended: false,

  carrier: '',
  carrierLogo: '',

  price20GP: '',
  price40GP: '',
  price40HQ: '',
  price45HQ: '',
  currency: 'USD',

  cost20GP: '',
  cost40GP: '',
  cost40HQ: '',
  cost45HQ: '',
  isAllIn: false,

  transitTime: '',
  schedule: '',

  vesselName: '',
  voyage: '',
  sailingDate: '',
  estimatedDeparture: '',

  bookingAgent: '',
  bookingLink: '',
  spaceStatus: 'AVAILABLE',

  docCutoffDay: '',
  docCutoffTime: '',

  billOfLadingType: '',
  shippingTerms: '',
  deliveryGuide: '',

  surcharges: [],
  weightLimit: '',

  priceTrend: '',
  contactInfo: '',
  receiptGuide: '',
  remarks: '',

  status: 'ACTIVE'
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

// 右侧划入卡片组件 - 半透明遮罩
function SlideOverPanel({ isOpen, onClose, title, subtitle, children, onSave, saving }: SlideOverPanelProps) {
  const [showBackdrop, setShowBackdrop] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowBackdrop(true)
      setTimeout(() => setShowPanel(true), 10)
    } else {
      setShowPanel(false)
      setTimeout(() => setShowBackdrop(false), 300)
    }
  }, [isOpen])

  if (!showBackdrop && !isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      pointerEvents: showPanel ? 'auto' : 'none'
    }}>
      {/* Backdrop - 半透明遮罩，可以看到后面的列表 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.2)',
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
        width: 'min(680px, 90vw)',
        background: '#F5F5F7',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ship size={22} style={{ color: '#34C759' }} />
            </div>
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
              Cancel
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
              {saving ? 'Saving...' : 'Save'}
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
          route: rate.route || '',
          routeCode: rate.routeCode || '',
          originPort: rate.originPort || '',
          originPortEn: rate.originPortEn || '',
          destinationPort: rate.destinationPort || '',
          destinationPortEn: rate.destinationPortEn || '',
          viaPort: rate.viaPort || '',
          viaPortEn: rate.viaPortEn || '',
          portArea: rate.portArea || '',

          validFrom: rate.validFrom ? rate.validFrom.split('T')[0] : '',
          validTo: rate.validTo ? rate.validTo.split('T')[0] : '',
          validityType: rate.validityType || 'LONG',
          isRecommended: rate.isRecommended || false,

          carrier: rate.carrier || '',
          carrierLogo: rate.carrierLogo || '',

          price20GP: rate.price20GP?.toString() || '',
          price40GP: rate.price40GP?.toString() || '',
          price40HQ: rate.price40HQ?.toString() || '',
          price45HQ: rate.price45HQ?.toString() || '',
          currency: rate.currency || 'USD',

          cost20GP: rate.cost20GP?.toString() || '',
          cost40GP: rate.cost40GP?.toString() || '',
          cost40HQ: rate.cost40HQ?.toString() || '',
          cost45HQ: rate.cost45HQ?.toString() || '',
          isAllIn: rate.isAllIn || false,

          transitTime: rate.transitTime?.toString() || '',
          schedule: rate.schedule || '',

          vesselName: rate.vesselName || '',
          voyage: rate.voyage || '',
          sailingDate: rate.sailingDate ? rate.sailingDate.split('T')[0] : '',
          estimatedDeparture: rate.estimatedDeparture ? rate.estimatedDeparture.split('T')[0] : '',

          bookingAgent: rate.bookingAgent || '',
          bookingLink: rate.bookingLink || '',
          spaceStatus: rate.spaceStatus || 'AVAILABLE',

          docCutoffDay: rate.docCutoffDay || '',
          docCutoffTime: rate.docCutoffTime || '',

          billOfLadingType: rate.billOfLadingType || '',
          shippingTerms: rate.shippingTerms || '',
          deliveryGuide: rate.deliveryGuide || '',

          surcharges: rate.surcharges?.map((s: any) => ({
            name: s.name,
            amount: s.amount?.toString() || '',
            unit: s.unit || 'per_container'
          })) || [],
          weightLimit: rate.weightLimit || '',

          priceTrend: rate.priceTrend || '',
          contactInfo: rate.contactInfo || '',
          receiptGuide: rate.receiptGuide || '',
          remarks: rate.remarks || '',

          status: rate.status || 'ACTIVE'
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load freight rate')
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
        price45HQ: formData.price45HQ ? parseFloat(formData.price45HQ) : null,
        cost20GP: formData.cost20GP ? parseFloat(formData.cost20GP) : null,
        cost40GP: formData.cost40GP ? parseFloat(formData.cost40GP) : null,
        cost40HQ: formData.cost40HQ ? parseFloat(formData.cost40HQ) : null,
        cost45HQ: formData.cost45HQ ? parseFloat(formData.cost45HQ) : null,
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
      setError(err.message || 'Save failed')
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

  const updateSurcharge = (index: number, field: keyof Surcharge, value: string) => {
    setFormData(prev => ({
      ...prev,
      surcharges: prev.surcharges.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      )
    }))
  }

  const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: 20,
      marginBottom: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16
      }}>
        <Icon size={18} style={{ color: '#007AFF' }} />
        <h3 style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#1D1D1F',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )

  const Input = ({ label, value, onChange, type = 'text', placeholder, required }: {
    label: string
    value: string
    onChange: (val: string) => void
    type?: string
    placeholder?: string
    required?: boolean
  }) => (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: '#FF3B30' }}> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )

  const PriceInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#86868B' }} />
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>
    </div>
  )

  return (
    <SlideOverPanel
      isOpen={true}
      onClose={() => navigate('/freight-rates')}
      title={isEditing ? 'Edit Sea FCL Rate' : 'New Sea FCL Rate'}
      subtitle="SEA FCL Freight Rate Management"
      onSave={handleSave}
      saving={saving}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ color: '#86868B', fontSize: 14 }}>Loading...</div>
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

          {/* Basic Info */}
          <Section title="Basic Information" icon={Anchor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Input
                label="Route Name"
                value={formData.route}
                onChange={(v) => setFormData(prev => ({ ...prev, route: v }))}
                placeholder="e.g. Far East - West Coast"
              />
              <Input
                label="Route Code"
                value={formData.routeCode}
                onChange={(v) => setFormData(prev => ({ ...prev, routeCode: v }))}
                placeholder="e.g. FEA-WC"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isRecommended}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecommended: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: '#007AFF' }}
                />
                <Star size={16} style={{ color: formData.isRecommended ? '#FF9500' : '#86868B' }} />
                <span style={{ fontSize: 14, color: '#3A3A3C' }}>Recommended Rate</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isAllIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAllIn: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: '#007AFF' }}
                />
                <span style={{ fontSize: 14, color: '#3A3A3C' }}>ALL IN Price</span>
              </label>
            </div>
          </Section>

          {/* Port Information */}
          <Section title="Port Information" icon={MapPin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <Input
                label="Origin Port (POL)"
                value={formData.originPort}
                onChange={(v) => setFormData(prev => ({ ...prev, originPort: v }))}
                placeholder="e.g. Shanghai"
                required
              />
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
                <ChevronRight size={20} style={{ color: '#C7C7CC' }} />
              </div>
              <Input
                label="Destination Port (POD)"
                value={formData.destinationPort}
                onChange={(v) => setFormData(prev => ({ ...prev, destinationPort: v }))}
                placeholder="e.g. Los Angeles"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Via Port"
                value={formData.viaPort}
                onChange={(v) => setFormData(prev => ({ ...prev, viaPort: v }))}
                placeholder="Optional"
              />
              <Input
                label="Port Area"
                value={formData.portArea}
                onChange={(v) => setFormData(prev => ({ ...prev, portArea: v }))}
                placeholder="e.g. Yangshan"
              />
            </div>
          </Section>

          {/* Validity */}
          <Section title="Validity Period" icon={Calendar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Valid From *</label>
                <input
                  type="date"
                  required
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Valid To *</label>
                <input
                  type="date"
                  required
                  value={formData.validTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  value={formData.validityType}
                  onChange={(e) => setFormData(prev => ({ ...prev, validityType: e.target.value as any }))}
                  style={inputStyle}
                >
                  <option value="LONG">Long-term</option>
                  <option value="SHORT">Short-term</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Carrier & Transit */}
          <Section title="Carrier & Transit" icon={Ship}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Input
                label="Carrier"
                value={formData.carrier}
                onChange={(v) => setFormData(prev => ({ ...prev, carrier: v }))}
                placeholder="e.g. COSCO"
              />
              <Input
                label="Transit Time (Days)"
                value={formData.transitTime}
                onChange={(v) => setFormData(prev => ({ ...prev, transitTime: v }))}
                type="number"
                placeholder="e.g. 14"
              />
              <Input
                label="Schedule"
                value={formData.schedule}
                onChange={(v) => setFormData(prev => ({ ...prev, schedule: v }))}
                placeholder="e.g. Mon/Wed/Fri"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Input
                label="Vessel Name"
                value={formData.vesselName}
                onChange={(v) => setFormData(prev => ({ ...prev, vesselName: v }))}
                placeholder="Optional"
              />
              <Input
                label="Voyage"
                value={formData.voyage}
                onChange={(v) => setFormData(prev => ({ ...prev, voyage: v }))}
                placeholder="Optional"
              />
              <div>
                <label style={labelStyle}>Space Status</label>
                <select
                  value={formData.spaceStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, spaceStatus: e.target.value as any }))}
                  style={inputStyle}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="LIMITED">Limited</option>
                  <option value="FULL">Full</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing (Sell)" icon={DollarSign}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#86868B' }}>Container rates in {formData.currency}</span>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: 13,
                  background: '#fff'
                }}
              >
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <PriceInput
                label="20'GP"
                value={formData.price20GP}
                onChange={(v) => setFormData(prev => ({ ...prev, price20GP: v }))}
              />
              <PriceInput
                label="40'GP"
                value={formData.price40GP}
                onChange={(v) => setFormData(prev => ({ ...prev, price40GP: v }))}
              />
              <PriceInput
                label="40'HQ"
                value={formData.price40HQ}
                onChange={(v) => setFormData(prev => ({ ...prev, price40HQ: v }))}
              />
              <PriceInput
                label="45'HQ"
                value={formData.price45HQ}
                onChange={(v) => setFormData(prev => ({ ...prev, price45HQ: v }))}
              />
            </div>
          </Section>

          {/* Cost */}
          <Section title="Cost Price (Optional)" icon={TrendingUp}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <PriceInput
                label="20'GP Cost"
                value={formData.cost20GP}
                onChange={(v) => setFormData(prev => ({ ...prev, cost20GP: v }))}
              />
              <PriceInput
                label="40'GP Cost"
                value={formData.cost40GP}
                onChange={(v) => setFormData(prev => ({ ...prev, cost40GP: v }))}
              />
              <PriceInput
                label="40'HQ Cost"
                value={formData.cost40HQ}
                onChange={(v) => setFormData(prev => ({ ...prev, cost40HQ: v }))}
              />
              <PriceInput
                label="45'HQ Cost"
                value={formData.cost45HQ}
                onChange={(v) => setFormData(prev => ({ ...prev, cost45HQ: v }))}
              />
            </div>
          </Section>

          {/* Booking */}
          <Section title="Booking Information" icon={User}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Input
                label="Booking Agent"
                value={formData.bookingAgent}
                onChange={(v) => setFormData(prev => ({ ...prev, bookingAgent: v }))}
                placeholder="Agent name or company"
              />
              <Input
                label="Booking Link"
                value={formData.bookingLink}
                onChange={(v) => setFormData(prev => ({ ...prev, bookingLink: v }))}
                placeholder="https://..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Contact Info"
                value={formData.contactInfo}
                onChange={(v) => setFormData(prev => ({ ...prev, contactInfo: v }))}
                placeholder="Phone or email"
              />
              <div>
                <label style={labelStyle}>Price Trend</label>
                <select
                  value={formData.priceTrend}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceTrend: e.target.value as any }))}
                  style={inputStyle}
                >
                  <option value="">Select trend</option>
                  <option value="UP">Up</option>
                  <option value="DOWN">Down</option>
                  <option value="STABLE">Stable</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Cutoff & Documentation */}
          <Section title="Documentation" icon={FileText}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Input
                label="Doc Cutoff Day"
                value={formData.docCutoffDay}
                onChange={(v) => setFormData(prev => ({ ...prev, docCutoffDay: v }))}
                placeholder="e.g. Tuesday"
              />
              <Input
                label="Doc Cutoff Time"
                value={formData.docCutoffTime}
                onChange={(v) => setFormData(prev => ({ ...prev, docCutoffTime: v }))}
                placeholder="e.g. 12:00"
              />
              <div>
                <label style={labelStyle}>B/L Type</label>
                <select
                  value={formData.billOfLadingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, billOfLadingType: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select type</option>
                  <option value="ORIGINAL">Original B/L</option>
                  <option value="TELEX_RELEASE">Telex Release</option>
                  <option value="SEA_WAYBILL">Sea Waybill</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Shipping Terms</label>
                <select
                  value={formData.shippingTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingTerms: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select terms</option>
                  <option value="CY-CY">CY-CY</option>
                  <option value="CFS-CFS">CFS-CFS</option>
                  <option value="CY-CFS">CY-CFS</option>
                  <option value="CFS-CY">CFS-CY</option>
                  <option value="DOOR-DOOR">DOOR-DOOR</option>
                </select>
              </div>
              <Input
                label="Weight Limit"
                value={formData.weightLimit}
                onChange={(v) => setFormData(prev => ({ ...prev, weightLimit: v }))}
                placeholder="e.g. 21 tons for 20GP"
              />
            </div>
          </Section>

          {/* Surcharges */}
          <Section title="Surcharges" icon={Package}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#86868B' }}>Additional charges</span>
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
                  cursor: 'pointer'
                }}
              >
                + Add
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
                No surcharges added
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {formData.surcharges.map((surcharge, index) => (
                  <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={surcharge.name}
                        onChange={(e) => updateSurcharge(index, 'name', e.target.value)}
                        placeholder="Name (e.g. ORC)"
                        style={{ ...inputStyle, fontSize: 13 }}
                      />
                    </div>
                    <div style={{ width: 100 }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={surcharge.amount}
                        onChange={(e) => updateSurcharge(index, 'amount', e.target.value)}
                        placeholder="Amount"
                        style={{ ...inputStyle, fontSize: 13 }}
                      />
                    </div>
                    <div style={{ width: 100 }}>
                      <select
                        value={surcharge.unit}
                        onChange={(e) => updateSurcharge(index, 'unit', e.target.value)}
                        style={{ ...inputStyle, fontSize: 13 }}
                      >
                        <option value="per_container">Per Container</option>
                        <option value="per_ton">Per Ton</option>
                        <option value="per_cbm">Per CBM</option>
                        <option value="per_bl">Per B/L</option>
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
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Remarks & Status */}
          <Section title="Remarks & Status" icon={Clock}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Add any additional notes..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'ACTIVE', label: 'Active', color: '#34C759' },
                  { value: 'INACTIVE', label: 'Inactive', color: '#8E8E93' }
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
                      cursor: 'pointer'
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
          </Section>
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
