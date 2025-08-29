import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/app/@/components/auth-form/login-form'


jest.mock('@/app/services/Api/login', () => ({
  loginUser: jest.fn(),
}))


jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
}))


jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
}))


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))


jest.mock('js-cookie', () => ({
  set: jest.fn(),
}))


const noop = () => {}
jest.spyOn(console, 'log').mockImplementation(noop)
jest.spyOn(console, 'error').mockImplementation(noop)
jest.spyOn(console, 'warn').mockImplementation(noop)

describe('LoginForm Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument()
  })

  it('shows forgot password form when clicked', async () => {
    render(<LoginForm />)

    const forgotButton = screen.getByText(/forgot your password/i)
    await user.click(forgotButton)

    expect(screen.getByText(/back to login/i)).toBeInTheDocument()
  })

  it('handles form submission with valid data', async () => {
    const { loginUser: mockLoginUser } = require('@/app/services/Api/login')
    mockLoginUser.mockResolvedValue({
      token: 'mock-token',
      user: { id: 1, name: 'Test User', email: 'test@example.com' }
    })

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'default',
        url: '',
        json: () => Promise.resolve({
          user: { onboarded: true, gender: 'male', userTopics: [] }
        })
      } as Response)
    )

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /^login$/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows error message on login failure', async () => {
    const { loginUser: mockLoginUser } = require('@/app/services/Api/login')
    mockLoginUser.mockRejectedValue(new Error('Invalid credentials'))

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

    const submitButton = screen.getByRole('button', { name: /^login$/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
