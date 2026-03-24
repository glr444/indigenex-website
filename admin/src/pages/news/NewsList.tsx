import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Plus, Edit2, Trash2, Eye, EyeOff, Newspaper } from 'lucide-react'

interface News {
  id: string
  title: string
  slug: string
  summary?: string
  isPublished: boolean
  publishedAt?: string
  createdAt: string
}

export default function NewsList() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNews() }, [])

  const fetchNews = async () => {
    try {
      const response = await axios.get('/api/news')
      setNews(response.data.data.news || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    try {
      await axios.delete(`/api/news/${id}`)
      setNews(news.filter(n => n.id !== id))
    } catch {
      alert('删除文章失败')
    }
  }

  const handleTogglePublish = async (item: News) => {
    try {
      await axios.put(`/api/news/${item.id}`, { isPublished: !item.isPublished })
      fetchNews()
    } catch {
      alert('更新文章失败')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.5px', margin: 0 }}>新闻管理</h1>
          <p style={{ fontSize: 14, color: '#86868B', marginTop: 4 }}>共 {news.length} 篇文章</p>
        </div>
        <Link to="/news/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '9px 16px', borderRadius: 10,
          background: '#007AFF', color: '#fff',
          fontSize: 14, fontWeight: 500, textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(0,122,255,0.3)',
          transition: 'opacity 0.15s',
        }}>
          <Plus size={16} strokeWidth={2} />
          新建文章
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#86868B', fontSize: 14 }}>加载中...</div>
      ) : news.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 14, padding: '60px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
          textAlign: 'center',
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,122,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Newspaper size={24} color="#007AFF" strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', margin: '0 0 6px' }}>暂无文章</p>
          <p style={{ fontSize: 14, color: '#86868B', margin: '0 0 20px' }}>创建您的第一篇文章开始管理新闻。</p>
          <Link to="/news/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10,
            background: '#007AFF', color: '#fff',
            fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}>
            <Plus size={15} /> 新建文章
          </Link>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px',
            padding: '12px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            background: '#FAFAFA',
          }}>
            {['文章', '状态', '日期', '操作'].map((h, i) => (
              <div key={h} style={{ fontSize: 12, fontWeight: 600, color: '#86868B', letterSpacing: '0.3px', textAlign: i === 3 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {news.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: idx < news.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F9F9FB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Title */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F', marginBottom: 2 }}>{item.title}</div>
                {item.summary && <div style={{ fontSize: 12, color: '#86868B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{item.summary}</div>}
              </div>

              {/* Status toggle */}
              <div>
                <button
                  onClick={() => handleTogglePublish(item)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500,
                    background: item.isPublished ? 'rgba(52,199,89,0.1)' : 'rgba(0,0,0,0.05)',
                    color: item.isPublished ? '#248A3D' : '#86868B',
                    transition: 'all 0.15s',
                  }}
                >
                  {item.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                  {item.isPublished ? '已发布' : '草稿'}
                </button>
              </div>

              {/* Date */}
              <div style={{ fontSize: 13, color: '#86868B' }}>
                {new Date(item.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                <Link to={`/news/edit/${item.id}`} style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#86868B', textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,122,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#007AFF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#86868B' }}
                >
                  <Edit2 size={15} strokeWidth={1.5} />
                </Link>
                <button onClick={() => handleDelete(item.id)} style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', cursor: 'pointer', color: '#86868B',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.08)'; e.currentTarget.style.color = '#FF3B30' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#86868B' }}
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
