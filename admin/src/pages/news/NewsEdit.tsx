import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Save } from 'lucide-react'

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

export default function NewsEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    title: '', slug: '', content: '', summary: '', imageUrl: '', isPublished: false,
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (isEdit) fetchNews() }, [id])

  const fetchNews = async () => {
    try {
      const res = await axios.get(`/api/news/${id}`)
      const n = res.data.data.news
      setFormData({ title: n.title, slug: n.slug, content: n.content, summary: n.summary || '', imageUrl: n.imageUrl || '', isPublished: n.isPublished })
    } catch {
      alert('加载文章失败')
      navigate('/news')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleTitleChange = (title: string) =>
    setFormData(prev => ({ ...prev, title, slug: isEdit ? prev.slug : generateSlug(title) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('标题和内容不能为空')
      return
    }
    setSaving(true)
    try {
      if (isEdit) await axios.put(`/api/news/${id}`, formData)
      else await axios.post('/api/news', formData)
      navigate('/news')
    } catch (err: any) {
      alert(err.response?.data?.message || '保存文章失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ color: '#86868B', fontSize: 14 }}>加载中...</div>

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/news')} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
          background: '#fff', cursor: 'pointer', color: '#3A3A3C',
        }}>
          <ArrowLeft size={16} strokeWidth={1.75} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.4px', margin: 0 }}>
            {isEdit ? '编辑文章' : '新建文章'}
          </h1>
          <p style={{ fontSize: 13, color: '#86868B', marginTop: 2 }}>
            {isEdit ? '在下方修改文章详情' : '填写以下信息创建新文章'}
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
            <div style={{ fontSize: 12, fontWeight: 600, color: '#86868B', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 16 }}>基本信息</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>标题 <span style={{ color: '#FF3B30' }}>*</span></label>
                <input
                  style={inputStyle}
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="请输入文章标题"
                  onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={labelStyle}>URL 别名</label>
                <input
                  style={{ ...inputStyle, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="article-url-slug"
                  onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={labelStyle}>摘要</label>
                <input
                  style={inputStyle}
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="简短描述（可选）"
                  onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={labelStyle}>图片 URL</label>
                <input
                  style={inputStyle}
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Section: Content */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#86868B', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 16 }}>文章内容</div>
            <label style={labelStyle}>文章内容 <span style={{ color: '#FF3B30' }}>*</span></label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              rows={14}
              placeholder="在此输入文章内容...（支持 HTML）"
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                fontSize: 13,
                lineHeight: 1.6,
              }}
              onFocus={e => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Section: Publishing */}
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div
                onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                style={{
                  width: 44, height: 26, borderRadius: 13,
                  background: formData.isPublished ? '#34C759' : '#D1D1D6',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: formData.isPublished ? 21 : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>
                {formData.isPublished ? '已发布 — 网站可见' : '草稿 — 仅后台可见'}
              </span>
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => navigate('/news')} style={{
                padding: '9px 18px', borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.12)', background: '#fff',
                fontSize: 14, fontWeight: 500, color: '#3A3A3C', cursor: 'pointer',
              }}>
                取消
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
                {saving ? '保存中...' : '保存文章'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
