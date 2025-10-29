import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  test('initializes with default state', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.user).toBe(null)
    expect(result.current.token).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe(null)
  })

  test('initializes with stored token and validates it', async () => {
    const mockToken = 'stored-token'
    const mockUser = { id: '123', email: 'admin@test.com', role: 'admin' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken) // adminToken
      .mockReturnValueOnce(JSON.stringify(mockUser)) // adminUser
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        user: mockUser
      })
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
    
    expect(fetch).toHaveBeenCalledWith('/api/auth/validate-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      }
    })
  })

  test('clears invalid stored token', async () => {
    const mockToken = 'invalid-token'
    const mockUser = { id: '123', email: 'admin@test.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
    expect(result.current.token).toBe(null)
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminToken')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser')
  })

  test('login function works correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    const mockToken = 'new-token'
    const mockUser = { id: '123', email: 'admin@test.com', role: 'admin' }
    
    let loginResult
    await act(async () => {
      loginResult = await result.current.login(mockToken, mockUser)
    })
    
    expect(loginResult.success).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('adminToken', mockToken)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('adminUser', JSON.stringify(mockUser))
  })

  test('logout function works correctly', async () => {
    const mockToken = 'test-token'
    const mockUser = { id: '123', email: 'admin@test.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
    
    // Mock logout API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logout successful' })
    })
    
    await act(async () => {
      await result.current.logout()
    })
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
    expect(result.current.token).toBe(null)
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminToken')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser')
  })

  test('refreshToken function works correctly', async () => {
    const mockToken = 'old-token'
    const mockUser = { id: '123', email: 'admin@test.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: mockUser })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'new-token',
          expiresIn: '8h'
        })
      })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
    
    let refreshResult
    await act(async () => {
      refreshResult = await result.current.refreshToken()
    })
    
    expect(refreshResult.success).toBe(true)
    expect(refreshResult.token).toBe('new-token')
    expect(result.current.token).toBe('new-token')
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('adminToken', 'new-token')
  })

  test('refreshToken handles failure correctly', async () => {
    const mockToken = 'old-token'
    const mockUser = { id: '123', email: 'admin@test.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: mockUser })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401
      })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
    
    let refreshResult
    await act(async () => {
      refreshResult = await result.current.refreshToken()
    })
    
    expect(refreshResult.success).toBe(false)
    expect(result.current.isAuthenticated).toBe(false) // Should logout on refresh failure
  })

  test('hasRole function works correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    // No user - should return false
    expect(result.current.hasRole('admin')).toBe(false)
    
    // Login with admin user
    const mockUser = { id: '123', email: 'admin@test.com', role: 'admin' }
    await act(async () => {
      await result.current.login('token', mockUser)
    })
    
    expect(result.current.hasRole('admin')).toBe(true)
    expect(result.current.hasRole('moderator')).toBe(false)
    expect(result.current.isAdmin()).toBe(true)
  })

  test('updateUser function works correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    const mockUser = { id: '123', email: 'admin@test.com', name: 'Admin' }
    await act(async () => {
      await result.current.login('token', mockUser)
    })
    
    const updatedData = { name: 'Updated Admin', lastLoginAt: new Date().toISOString() }
    
    act(() => {
      result.current.updateUser(updatedData)
    })
    
    expect(result.current.user.name).toBe('Updated Admin')
    expect(result.current.user.lastLoginAt).toBe(updatedData.lastLoginAt)
    expect(result.current.user.email).toBe('admin@test.com') // Should preserve existing data
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'adminUser', 
      JSON.stringify({ ...mockUser, ...updatedData })
    )
  })

  test('apiRequest function works correctly', async () => {
    const mockToken = 'test-token'
    const mockUser = { id: '123', email: 'admin@test.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: mockUser })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' })
      })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
    
    let response
    await act(async () => {
      response = await result.current.apiRequest('/api/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      })
    })
    
    expect(response.ok).toBe(true)
    expect(fetch).toHaveBeenLastCalledWith('/api/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      }
    })
  })

  test('apiRequest handles token refresh on 401', async () => {
    const mockToken = 'old-token'
    const mockUser = { id: '123', email: 'admin@test.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: mockUser })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'new-token' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' })
      })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
    
    let response
    await act(async () => {
      response = await result.current.apiRequest('/api/test')
    })
    
    expect(response.ok).toBe(true)
    expect(result.current.token).toBe('new-token')
  })

  test('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})