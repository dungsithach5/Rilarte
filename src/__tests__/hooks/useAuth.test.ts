import { renderHook } from '@testing-library/react'
import { useAuth } from '@/app/hooks/useAuth'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

describe('useAuth Hook', () => {
  const mockUseSession = require('next-auth/react').useSession
  const mockUseSelector = require('react-redux').useSelector

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns user data when authenticated via NextAuth', () => {
    const mockSession = {
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    }

    mockUseSession.mockReturnValue(mockSession)
    mockUseSelector.mockReturnValue({ user: null, token: null })

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(mockSession.data.user)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.status).toBe('authenticated')
  })

  it('returns user data when authenticated via Redux', () => {
    const mockReduxUser = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
      token: 'mock-token',
    }

    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    mockUseSelector.mockReturnValue(mockReduxUser)

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(mockReduxUser.user)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('returns undefined when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    mockUseSelector.mockReturnValue({ user: null, token: null })

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeUndefined()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.status).toBe('unauthenticated')
  })

  it('returns loading state when session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' })
    mockUseSelector.mockReturnValue({ user: null, token: null })

    const { result } = renderHook(() => useAuth())

    expect(result.current.status).toBe('loading')
  })
})
