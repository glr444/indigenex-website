import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react'
import { customerApi } from '../../utils/api'

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    creditCode: '',
    industry: '',
    scale: '',
    preferredRoutes: [] as string[],
    settlementType: '',
    level: 'D',
    type: 'direct',
    monthlyVolume: '',
    transportModes: [] as string[],
    targetRoutes: '',
    requirements: '',
    competition: '',
    tags: [] as string[],
    contacts: [] as Array<{
      name: string
      position: string
      phone: string
      wechat: string
      email: string
      isPrimary: boolean
    }>
  })

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
        const data = response.data as any
        setFormData({
          name: data.name || '',
          creditCode: data.creditCode || '',
          industry: data.industry || '',
          scale: data.scale || '',
          preferredRoutes: data.preferredRoutes || [],
          settlementType: data.settlementType || '',
          level: data.level || 'D',
          type: data.type || 'direct',
          monthlyVolume: data.monthlyVolume?.toString() || '',
          transportModes: data.transportModes || [],
          targetRoutes: data.targetRoutes || '',
          requirements: data.requirements || '',
          competition: data.competition || '',
          tags: data.tags || [],
          contacts: data.contacts?.map((c: any) => ({
            name: c.name,
            position: c.position || '',
            phone: c.phone || '',
            wechat: c.wechat || '',
            email: c.email || '',
            isPrimary: c.isPrimary
          })) || []
        })
      }
    } catch (err) {
      console.error('Fetch customer error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const data = {
        ...formData,
        monthlyVolume: formData.monthlyVolume ? parseInt(formData.monthlyVolume) : null,
        contacts: formData.contacts.filter(c => c.name.trim())
      }

      if (isEdit) {
        await customerApi.update(id!, data)
      } else {
        await customerApi.create(data)
      }
      navigate('/customers')
    } catch (err: any) {
      if (err.message?.includes('已存在')) {
        alert('该客户已存在，请检查公司名称或统一社会信用代码')
      } else {
        alert(isEdit ? '更新失败' : '创建失败')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleAddContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, {
        name: '',
        position: '',
        phone: '',
        wechat: '',
        email: '',
        isPrimary: prev.contacts.length === 0
      }]
    }))
  }

  const handleRemoveContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }))
  }

  const handleContactChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const tabs = [
    { id: 'basic', label: '基本信息' },
    { id: 'profile', label: '客户画像' },
    { id: 'contacts', label: '联系人' }
  ]

  const tagOptions = ['重点客户', '长期合作', '高潜力', '待开发', '谈判中', '已合作', '账期客户', '月结客户']

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: '#86868B' }}>加载中...</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <button
          onClick={() => navigate('/customers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 0',
            border: 'none',
            background: 'transparent',
            color: '#007AFF',
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: 12
          }}
        >
          <ArrowLeft size={14} />
          {t('common.back', '返回')}
        </button>

        <h1 style={{
          fontSize: 24,
          fontWeight: 600,
          color: '#1D1D1F',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          {isEdit ? t('customers.editCustomer', '编辑客户') : t('customers.newCustomer', '新增客户')}
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 16,
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        flexShrink: 0
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              background: activeTab === tab.id ? '#007AFF' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#3A3A3C',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {/* 基本信息 */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', margin: '0 0 8px' }}>
                基本信息
              </h3>
              <div style={{ display: 'flex', gap: 16 }}>
                <FormInput
                  label="公司名称 *"
                  value={formData.name}
                  onChange={v => setFormData(prev => ({ ...prev, name: v }))}
                  required
                  style={{ flex: 2 }}
                />
                <FormInput
                  label="统一社会信用代码"
                  value={formData.creditCode}
                  onChange={v => setFormData(prev => ({ ...prev, creditCode: v }))}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <FormSelect
                  label="行业类型"
                  value={formData.industry}
                  onChange={v => setFormData(prev => ({ ...prev, industry: v }))}
                  options={['进出口贸易', '制造业', '物流运输', '电子商务', '其他']}
                  style={{ flex: 1 }}
                />
                <FormSelect
                  label="公司规模"
                  value={formData.scale}
                  onChange={v => setFormData(prev => ({ ...prev, scale: v }))}
                  options={['1-50人', '50-100人', '100-500人', '500-1000人', '1000人以上']}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <FormSelect
                  label="结算方式偏好"
                  value={formData.settlementType}
                  onChange={v => setFormData(prev => ({ ...prev, settlementType: v }))}
                  options={['现结', '月结', '季度结', '到付']}
                  style={{ flex: 1 }}
                />
              </div>

              {/* 标签 */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1D1D1F', marginBottom: 8 }}>客户标签</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 16,
                        fontSize: 12,
                        background: '#007AFF',
                        color: '#fff'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#fff',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: 14
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddTag(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: 13,
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">+ 添加标签</option>
                  {tagOptions.filter(t => !formData.tags.includes(t)).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 客户画像 */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', margin: '0 0 8px' }}>
                客户画像
              </h3>
              <div style={{ display: 'flex', gap: 16 }}>
                <FormSelect
                  label="客户等级"
                  value={formData.level}
                  onChange={v => setFormData(prev => ({ ...prev, level: v }))}
                  options={[
                    { value: 'A', label: 'A级 - 核心客户' },
                    { value: 'B', label: 'B级 - 重要客户' },
                    { value: 'C', label: 'C级 - 一般客户' },
                    { value: 'D', label: 'D级 - 潜在客户' }
                  ]}
                  style={{ flex: 1 }}
                />
                <FormSelect
                  label="客户类型"
                  value={formData.type}
                  onChange={v => setFormData(prev => ({ ...prev, type: v }))}
                  options={[
                    { value: 'direct', label: '直客' },
                    { value: 'peer', label: '同行' },
                    { value: 'agent', label: '代理' }
                  ]}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <FormInput
                  label="月货量预估 (TEU)"
                  type="number"
                  value={formData.monthlyVolume}
                  onChange={v => setFormData(prev => ({ ...prev, monthlyVolume: v }))}
                  style={{ flex: 1 }}
                />
                <FormInput
                  label="目标航线"
                  value={formData.targetRoutes}
                  onChange={v => setFormData(prev => ({ ...prev, targetRoutes: v }))}
                  placeholder="如：美线、欧线"
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <FormTextArea
                  label="特殊需求"
                  value={formData.requirements}
                  onChange={v => setFormData(prev => ({ ...prev, requirements: v }))}
                  placeholder="记录客户的特殊需求..."
                  style={{ flex: 1 }}
                />
                <FormTextArea
                  label="竞争情况"
                  value={formData.competition}
                  onChange={v => setFormData(prev => ({ ...prev, competition: v }))}
                  placeholder="记录竞争对手情况..."
                  style={{ flex: 1 }}
                />
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
                marginBottom: 16
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>
                  联系人信息
                </h3>
                <button
                  type="button"
                  onClick={handleAddContact}
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
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} />
                  添加联系人
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {formData.contacts.map((contact, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#F5F5F7',
                      borderRadius: 12,
                      padding: 16
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          background: '#007AFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {contact.name ? contact.name.charAt(0) : '?'}
                        </span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                          <input
                            type="radio"
                            checked={contact.isPrimary}
                            onChange={() => {
                              setFormData(prev => ({
                                ...prev,
                                contacts: prev.contacts.map((c, i) => ({
                                  ...c,
                                  isPrimary: i === index
                                }))
                              }))
                            }}
                          />
                          设为主联系人
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(index)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#FF3B30'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <FormInput
                        label="姓名 *"
                        value={contact.name}
                        onChange={v => handleContactChange(index, 'name', v)}
                        required
                        style={{ flex: 1, minWidth: 150 }}
                      />
                      <FormInput
                        label="职位"
                        value={contact.position}
                        onChange={v => handleContactChange(index, 'position', v)}
                        style={{ flex: 1, minWidth: 150 }}
                      />
                      <FormInput
                        label="电话"
                        value={contact.phone}
                        onChange={v => handleContactChange(index, 'phone', v)}
                        style={{ flex: 1, minWidth: 150 }}
                      />
                      <FormInput
                        label="微信"
                        value={contact.wechat}
                        onChange={v => handleContactChange(index, 'wechat', v)}
                        style={{ flex: 1, minWidth: 150 }}
                      />
                      <FormInput
                        label="邮箱"
                        type="email"
                        value={contact.email}
                        onChange={v => handleContactChange(index, 'email', v)}
                        style={{ flex: 1, minWidth: 150 }}
                      />
                    </div>
                  </div>
                ))}

                {formData.contacts.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#86868B',
                    background: '#F5F5F7',
                    borderRadius: 12
                  }}>
                    暂无联系人，请点击上方按钮添加
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 20
        }}>
          <button
            type="button"
            onClick={() => navigate('/customers')}
            style={{
              padding: '10px 20px',
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
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 20px',
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
            {saving ? '保存中...' : (isEdit ? '保存修改' : '创建客户')}
          </button>
        </div>
      </form>
    </div>
  )
}

// 表单输入组件
interface FormInputProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  style?: React.CSSProperties
}

function FormInput({ label, value, onChange, type = 'text', required, placeholder, style }: FormInputProps) {
  return (
    <div style={{ ...style }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#1D1D1F', marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: '#FF3B30' }}>*</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.15s ease',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => e.target.style.borderColor = '#007AFF'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
      />
    </div>
  )
}

// 表单选择组件
interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[] | FormSelectOption[]
  style?: React.CSSProperties
}

function FormSelect({ label, value, onChange, options, style }: FormSelectProps) {
  return (
    <div style={{ ...style }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#1D1D1F', marginBottom: 6 }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          fontSize: 14,
          background: '#fff',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="">请选择</option>
        {options.map((opt: string | FormSelectOption) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// 文本域组件
interface FormTextAreaProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  style?: React.CSSProperties
}

function FormTextArea({ label, value, onChange, placeholder, style }: FormTextAreaProps) {
  return (
    <div style={{ ...style }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#1D1D1F', marginBottom: 6 }}>
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          fontSize: 14,
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit'
        }}
        onFocus={(e) => e.target.style.borderColor = '#007AFF'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
      />
    </div>
  )
}
