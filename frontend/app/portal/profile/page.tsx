'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Building2,
  Mail,
  Phone,
  Key,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface MemberInfo {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  role: string;
  position: string | null;
  dazhangguiEnterpriseId: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    position: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('memberToken');
      const response = await fetch('/api/member/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setMemberInfo(data.data);
        setFormData({
          companyName: data.data.companyName || '',
          contactName: data.data.contactName || '',
          phone: data.data.phone || '',
          position: data.data.position || '',
        });
      }
    } catch (err) {
      setError('获取个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('memberToken');
      const response = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMemberInfo(data.data);
        setEditing(false);
        setSuccess('保存成功');

        // 更新本地存储
        const storedInfo = localStorage.getItem('memberInfo');
        if (storedInfo) {
          const parsed = JSON.parse(storedInfo);
          localStorage.setItem('memberInfo', JSON.stringify({
            ...parsed,
            companyName: data.data.companyName,
            contactName: data.data.contactName,
          }));
        }
      } else {
        setError(data.message || '保存失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!memberInfo) {
    return (
      <div className="text-center py-20" style={{ color: '#86868B' }}>
        加载失败，请刷新页面重试
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: '#1D1D1F', letterSpacing: '-0.3px' }}
        >
          个人中心
        </h1>
        <p style={{ color: '#86868B', fontSize: 15 }}>
          管理您的账户信息
        </p>
      </div>

      {/* 消息提示 */}
      {error && (
        <div
          className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ background: '#FFE5E5' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FF3B30' }} />
          <span style={{ color: '#FF3B30', fontSize: 14 }}>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ background: '#E8F5E9' }}
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#34C759' }} />
          <span style={{ color: '#2E7D32', fontSize: 14 }}>{success}</span>
        </div>
      )}

      {/* 基本信息卡片 */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* 头部 */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(0,0,0,0.06)' }}
        >
          <h2 className="font-semibold" style={{ color: '#1D1D1F' }}>
            基本信息
          </h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ color: '#007AFF', background: 'rgba(0,122,255,0.08)' }}
            >
              <Edit2 size={16} />
              编辑
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    companyName: memberInfo.companyName || '',
                    contactName: memberInfo.contactName || '',
                    phone: memberInfo.phone || '',
                    position: memberInfo.position || '',
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ color: '#86868B', background: '#F5F5F7' }}
              >
                <X size={16} />
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-150"
                style={{ background: '#007AFF' }}
              >
                <Save size={16} />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          )}
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-5">
          {/* 企业名称 */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#86868B' }}
            >
              企业名称
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200"
                style={{
                  borderColor: 'rgba(0,0,0,0.08)',
                  fontSize: 15,
                  background: '#F5F5F7',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007AFF';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.target.style.background = '#F5F5F7';
                }}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,122,255,0.08)' }}
                >
                  <Building2 size={20} style={{ color: '#007AFF' }} />
                </div>
                <span
                  className="font-medium text-lg"
                  style={{ color: '#1D1D1F' }}
                >
                  {memberInfo.companyName}
                </span>
              </div>
            )}
          </div>

          {/* 联系人 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#86868B' }}
              >
                联系人姓名
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200"
                  style={{
                    borderColor: 'rgba(0,0,0,0.08)',
                    fontSize: 15,
                    background: '#F5F5F7',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007AFF';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                    e.target.style.background = '#F5F5F7';
                  }}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <User size={18} style={{ color: '#86868B' }} />
                  <span style={{ color: '#1D1D1F' }}>
                    {memberInfo.contactName}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#86868B' }}
              >
                职务
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  placeholder="请输入职务"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200"
                  style={{
                    borderColor: 'rgba(0,0,0,0.08)',
                    fontSize: 15,
                    background: '#F5F5F7',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007AFF';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                    e.target.style.background = '#F5F5F7';
                  }}
                />
              ) : (
                <span style={{ color: '#1D1D1F' }}>
                  {memberInfo.position || '未设置'}
                </span>
              )}
            </div>
          </div>

          {/* 联系方式 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#86868B' }}
              >
                邮箱
              </label>
              <div className="flex items-center gap-3">
                <Mail size={18} style={{ color: '#86868B' }} />
                <span style={{ color: '#1D1D1F' }}>{memberInfo.email}</span>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: '#86868B' }}
              >
                手机号
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200"
                  style={{
                    borderColor: 'rgba(0,0,0,0.08)',
                    fontSize: 15,
                    background: '#F5F5F7',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007AFF';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                    e.target.style.background = '#F5F5F7';
                  }}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <Phone size={18} style={{ color: '#86868B' }} />
                  <span style={{ color: '#1D1D1F' }}>{memberInfo.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 账户信息卡片 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold" style={{ color: '#1D1D1F' }}>
            账户信息
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-sm font-medium mb-1"
                style={{ color: '#1D1D1F' }}
              >
                会员角色
              </div>
              <div className="text-sm" style={{ color: '#86868B' }}>
                {memberInfo.role === 'ADMIN' ? '管理员' : '普通会员'}
              </div>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(0,122,255,0.08)',
                color: '#007AFF',
              }}
            >
              {memberInfo.role === 'ADMIN' ? '管理员' : '会员'}
            </span>
          </div>

          {memberInfo.dazhangguiEnterpriseId && (
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="text-sm font-medium mb-1"
                  style={{ color: '#1D1D1F' }}
                >
                  大掌柜企业ID
                </div>
                <div className="text-sm" style={{ color: '#86868B' }}>
                  已绑定大掌柜系统
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: '#E8F5E9', color: '#2E7D32' }}
              >
                <Key size={14} />
                已绑定
              </div>
            </div>
          )}

          <div
            className="pt-4 border-t"
            style={{ borderColor: 'rgba(0,0,0,0.06)' }}
          >
            <div
              className="text-sm font-medium mb-1"
              style={{ color: '#1D1D1F' }}
            >
              注册时间
            </div>
            <div className="text-sm" style={{ color: '#86868B' }}>
              {new Date(memberInfo.createdAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
