// use CommonJS to avoid ESM error
require('@testing-library/jest-dom')

// Rút gọn log để output ngắn
const noop = () => {}
jest.spyOn(console, 'log').mockImplementation(noop)
jest.spyOn(console, 'error').mockImplementation(noop)
jest.spyOn(console, 'warn').mockImplementation(noop)

// Giữ nguyên phần mock next/navigation, next/router, next/image, next/link,
// js-cookie, matchMedia, IntersectionObserver, fetch, storages như hiện tại.

// next/router (optional if you only use App Router)
jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
}))

// Next.js App Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() { return '/' },
  useSearchParams() { return new URLSearchParams() },
}))

// next/image: factory không tham chiếu biến ngoài scope
jest.mock('next/image', () => {
  return {
    __esModule: true,
    default: (props) => {
      const React = require('react')
      return React.createElement('img', props)
    },
  }
})

// next/link: factory không tham chiếu biến ngoài scope
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href, ...props }) => {
      const React = require('react')
      return React.createElement('a', { href, ...props }, children)
    },
  }
})

// js-cookie
jest.mock('js-cookie', () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}))

// window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// IntersectionObserver
global.IntersectionObserver = class {
  disconnect() {}
  observe() {}
  unobserve() {}
}

// fetch + storages
global.fetch = jest.fn()
global.localStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() }
global.sessionStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() }
