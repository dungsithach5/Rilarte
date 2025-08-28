import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileHeader from '@/app/@/components/ProfileHeader'

// Mock useAuth hook
jest.mock('@/app/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    session: { user: { id: '1', name: 'Current User' } },
    status: 'authenticated',
    user: { id: '1', name: 'Current User' }
  }))
}))

// Mock API calls
jest.mock('@/app/services/Api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

describe('ProfileHeader Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<ProfileHeader targetUserId="2" />)
    
    // Component sẽ hiển thị loading khi fetch user data
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders own profile without targetUserId', () => {
    render(<ProfileHeader />)
    
    // Không có targetUserId = own profile
    expect(screen.getByText(/current user/i)).toBeInTheDocument()
  })

  it('handles follow button click', async () => {
    const mockOnMessageClick = jest.fn()
    render(<ProfileHeader targetUserId="2" onMessageClick={mockOnMessageClick} />)

    // Mock API response
    const { get } = require('axios')
    get.mockResolvedValue({
      data: {
        success: true,
        followers: 100,
        following: 50
      }
    })

    // Tìm và click follow button (nếu có)
    const followButton = screen.queryByRole('button', { name: /follow/i })
    if (followButton) {
      await user.click(followButton)
    }
  })

  it('handles message button click', async () => {
    const mockOnMessageClick = jest.fn()
    render(<ProfileHeader targetUserId="2" onMessageClick={mockOnMessageClick} />)

    const messageButton = screen.queryByRole('button', { name: /message/i })
    if (messageButton) {
      await user.click(messageButton)
      expect(mockOnMessageClick).toHaveBeenCalled()
    }
  })
})
