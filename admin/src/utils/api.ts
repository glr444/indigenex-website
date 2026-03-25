const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api'

interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token')

  const url = `${API_BASE_URL}${endpoint}`
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  }

  if (options.body instanceof FormData) {
    delete (config.headers as Record<string, string>)['Content-Type']
  }

  const response = await fetch(url, config)

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('未登录')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || '请求失败')
  }

  return data
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    })
}

// News API
export const newsApi = {
  getAll: () => request('/news'),

  getById: (id: string) => request(`/news/${id}`),

  create: (data: any) =>
    request('/news', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: string, data: any) =>
    request(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    request(`/news/${id}`, {
      method: 'DELETE'
    })
}

// Contact API
export const contactApi = {
  getAll: () => request('/contact'),

  getById: (id: string) => request(`/contact/${id}`),

  markAsRead: (id: string) =>
    request(`/contact/${id}/read`, {
      method: 'PATCH'
    })
}

// Freight Rate API
export const freightRateApi = {
  getAll: (query?: string) =>
    request(`/admin/freight-rates${query ? `?${query}` : ''}`),

  getById: (id: string) =>
    request(`/admin/freight-rates/${id}`),

  create: (data: any) =>
    request('/admin/freight-rates', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: string, data: any) =>
    request(`/admin/freight-rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    request(`/admin/freight-rates/${id}`, {
      method: 'DELETE'
    }),

  import: (formData: FormData) =>
    request('/admin/freight-rates/import', {
      method: 'POST',
      body: formData
    })
}

// Member API
export const memberApi = {
  getAll: (query?: string) =>
    request(`/admin/members${query ? `?${query}` : ''}`),

  getById: (id: string) =>
    request(`/admin/members/${id}`),

  approve: (id: string) =>
    request(`/admin/members/${id}/approve`, {
      method: 'POST'
    }),

  reject: (id: string) =>
    request(`/admin/members/${id}/reject`, {
      method: 'POST'
    }),

  toggleStatus: (id: string) =>
    request(`/admin/members/${id}/toggle-status`, {
      method: 'POST'
    }),

  update: (id: string, data: any) =>
    request(`/admin/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  createApiKey: (id: string, data: any) =>
    request(`/admin/members/${id}/api-keys`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  revokeApiKey: (memberId: string, keyId: string) =>
    request(`/admin/members/${memberId}/api-keys/${keyId}`, {
      method: 'DELETE'
    })
}

// Port API
export const portApi = {
  getAll: (query?: string) =>
    request(`/admin/ports${query ? `?${query}` : ''}`),

  getById: (id: string) =>
    request(`/admin/ports/${id}`),

  create: (data: any) =>
    request('/admin/ports', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: string, data: any) =>
    request(`/admin/ports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    request(`/admin/ports/${id}`, {
      method: 'DELETE'
    })
}

// Route API
export const routeApi = {
  getAll: (query?: string) =>
    request(`/admin/routes${query ? `?${query}` : ''}`),

  getById: (id: string) =>
    request(`/admin/routes/${id}`),

  create: (data: any) =>
    request('/admin/routes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: string, data: any) =>
    request(`/admin/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    request(`/admin/routes/${id}`, {
      method: 'DELETE'
    })
}

// Carrier API
export const carrierApi = {
  getAll: (query?: string) =>
    request(`/admin/carriers${query ? `?${query}` : ''}`),

  getById: (id: string) =>
    request(`/admin/carriers/${id}`),

  create: (data: any) =>
    request('/admin/carriers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: string, data: any) =>
    request(`/admin/carriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    request(`/admin/carriers/${id}`, {
      method: 'DELETE'
    })
}
