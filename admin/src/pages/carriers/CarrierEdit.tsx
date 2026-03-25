import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Save, Ship } from 'lucide-react'
import { carrierApi } from '../../utils/api'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  fontSize: 14, color: '#1D1D1F',
  background: '#FAFAFA',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: 10, outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 500, color: '#3A3A3C', display: 'block', marginBottom: 6,
}

export default function CarrierEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    website: '',
    contactInfo: '',
    isActive: true
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) fetchCarrier()
  }, [id])

  const fetchCarrier = async () => {
    try {
      const response = await carrierApi.getById(id!)
      if (response.success) {
        const carrier = (response.data as any).carrier
        setFormData({
          code: carrier.code || '',
          name: carrier.name || '',
          nameEn: carrier.nameEn || '',
          website: carrier.website || '',
          contactInfo: carrier.contactInfo || '',
          isActive: carrier.isActive ?? true
        })
      }
    } catch (err) {
      alert(t('carriers.loadFailed'))
      navigate('/carriers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code.trim() || !formData.name.trim()) {
      alert(t('carriers.validationError'))
      return
    }
    setSaving(true)
    try {
      if (isEdit) {
        await carrierApi.update(id!, formData)
      } else {
        await carrierApi.create(formData)
      }
      navigate('/carriers')
    } catch (err: any) {
      alert(err.message || t('carriers.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ color: '#86868B', fontSize: 14 }}>{t('common.loading')}</div>

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/carriers')} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
          background: '#fff', cursor: 'pointer', color: '#3A3A3C',
        }}>
          <ArrowLeft size={16} strokeWidth={1.75} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.4px', margin: 0 }}>
            {isEdit ? t('carriers.editCarrier') : t('carriers.newCarrier')}
          </h1>
          <p style={{ fontSize: 13, color: '#86868B', marginTop: 2 }}>
            {isEdit ? t('carriers.editSubtitle') : t('carriers.newSubtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: '#fff', borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden', marginBottom: 16,
        }}>
          {/* Section: Basic Info */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Ship size={16} color="#86868B" />
              <div style={{ fontSize: 12, fontWeight: 600, color: '#86868B', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {t('carriers.basicInfo')}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>{t('carriers.code')} <span style={{ color: '#FF3B30' }}>*</span></label>
                  <input
                    style={inputStyle}
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder={t('carriers.codePlaceholder')}
                    disabled={isEdit}
                    onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t('carriers.name')} <span style={{ color: '#FF3B30' }}>*</span></label>
                  <input
                    style={inputStyle}
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('carriers.namePlaceholder')}
                    onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t('carriers.nameEn')}</label>
                <input
                  style={inputStyle}
                  value={formData.nameEn}
                  onChange={e => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                  placeholder={t('carriers.nameEnPlaceholder')}
                  onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Section: Contact Info */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#86868B', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 16 }}>
              {t('carriers.contactInfo')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>{t('carriers.website')}</label>
                <input
                  style={inputStyle}
                  value={formData.website}
                  onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('carriers.contact')}</label>
                <input
                  style={inputStyle}
                  value={formData.contactInfo}
                  onChange={e => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                  placeholder={t('carriers.contactPlaceholder')}
                  onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Section: Status */}
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                style={{
                  width: 44, height: 26, borderRadius: 13,
                  background: formData.isActive ? '#34C759' : '#D1D1D6',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: formData.isActive ? 21 : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>
                {formData.isActive ? t('common.active') : t('common.inactive')}
              </span>
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => navigate('/carriers')} style={{
                padding: '9px 18px', borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.12)', background: '#fff',
                fontSize: 14, fontWeight: 500, color: '#3A3A3C', cursor: 'pointer',
              }}>
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 20px', borderRadius: 10, border: 'none',
                background: saving ? '#86868B' : '#007AFF', color: '#fff',
                fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 2px 8px rgba(0,122,255,0.3)',
                transition: 'all 0.15s',
              }}>
                <Save size={15} strokeWidth={2} />
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
