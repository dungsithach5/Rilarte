import { cn, createSlug, createPostSlug, createPostUrl, createPostUrlFromTitle } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('class1', 'class2', { class3: true, class4: false })
      expect(result).toBe('class1 class2 class3')
    })

    it('handles empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })

  describe('createSlug', () => {
    it('creates slug from text', () => {
      const result = createSlug('Hello World Test')
      expect(result).toBe('hello-world-test')
    })

    it('handles special characters', () => {
      const result = createSlug('Test@#$%^&*()')
      expect(result).toBe('testdollarpercentand')
    })

    it('handles Vietnamese characters', () => {
      const result = createSlug('Xin chào thế giới')
      expect(result).toBe('xin-chao-the-gioi')
    })
  })

  describe('createPostSlug', () => {
    it('creates post slug with id', () => {
      const result = createPostSlug('Test Post Title', 123)
      expect(result).toBe('test-post-title-123')
    })
  })

  describe('createPostUrl', () => {
    it('creates post URL from slug', () => {
      const result = createPostUrl('test-post-title-123')
      expect(result).toBe('/post/test-post-title-123')
    })
  })

  describe('createPostUrlFromTitle', () => {
    it('creates post URL from title and id', () => {
      const result = createPostUrlFromTitle('Test Post Title', 123)
      expect(result).toBe('/post/test-post-title-123')
    })
  })
})
