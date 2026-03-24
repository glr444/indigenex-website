import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Newspaper, MessageSquare, Eye, TrendingUp, ArrowUpRight } from 'lucide-react'

interface Stats {
  totalNews: number
  publishedNews: number
  totalContacts: number
  unreadContacts: number
}

const card = {
  background: '#fff',
  borderRadius: 14,
  padding: '22px 24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalNews: 0, publishedNews: 0, totalContacts: 0, unreadContacts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const [newsRes, contactsRes] = await Promise.all([
        axios.get('/api/news'),
        axios.get('/api/contact')
      ])
      const news = newsRes.data.data.news || []
      const contacts = contactsRes.data.data.contacts || []
      setStats({
        totalNews: news.length,
        publishedNews: news.filter((n: any) => n.isPublished).length,
        totalContacts: contacts.length,
        unreadContacts: contacts.filter((c: any) => !c.isRead).length,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: '文章总数', value: stats.totalNews, sub: '已发布新闻', icon: Newspaper, color: '#007AFF', bg: 'rgba(0,122,255,0.08)' },
    { label: '已发布', value: stats.publishedNews, sub: '网站上线中', icon: Eye, color: '#34C759', bg: 'rgba(52,199,89,0.08)' },
    { label: '留言总数', value: stats.totalContacts, sub: '收到的咨询', icon: MessageSquare, color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)' },
    { label: '未读留言', value: stats.unreadContacts, sub: '待处理', icon: TrendingUp, color: '#FF3B30', bg: 'rgba(255,59,48,0.08)' },
  ]

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.5px', margin: 0 }}>概览</h1>
        <p style={{ fontSize: 14, color: '#86868B', marginTop: 4 }}>欢迎回来，以下是今日数据概览。</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ color: '#86868B', fontSize: 14 }}>加载中...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {statCards.map((s) => (
            <div key={s.label} style={card}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={18} color={s.color} strokeWidth={1.75} />
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F', marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#86868B', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>新闻管理</h2>
            <Link to="/news/new" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, fontWeight: 500, color: '#007AFF', textDecoration: 'none',
              padding: '6px 12px', borderRadius: 8, background: 'rgba(0,122,255,0.08)',
            }}>
              新建文章 <ArrowUpRight size={13} />
            </Link>
          </div>
          <p style={{ fontSize: 13, color: '#86868B', lineHeight: 1.6, margin: 0 }}>
            创建和管理新闻文章。当前网站已发布 {stats.publishedNews} / {stats.totalNews} 篇文章。
          </p>
          <Link to="/news" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginTop: 16, fontSize: 13, fontWeight: 500, color: '#007AFF', textDecoration: 'none',
          }}>
            查看全部文章 <ArrowUpRight size={13} />
          </Link>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>留言咨询</h2>
            {stats.unreadContacts > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 600, color: '#FF3B30',
                background: 'rgba(255,59,48,0.1)', padding: '3px 9px', borderRadius: 20,
              }}>
                {stats.unreadContacts} 条新消息
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#86868B', lineHeight: 1.6, margin: 0 }}>
            {stats.unreadContacts > 0
              ? `您有 ${stats.unreadContacts} 条未读留言等待处理。`
              : '所有留言已处理完毕，继续保持！'}
          </p>
          <Link to="/contacts" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginTop: 16, fontSize: 13, fontWeight: 500, color: '#007AFF', textDecoration: 'none',
          }}>
            查看全部留言 <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}
