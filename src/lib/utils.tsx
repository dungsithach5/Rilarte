import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from "slugify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi'
  })
}

export function createPostSlug(title: string, id: number): string {
  const slug = createSlug(title)
  return `${slug}-${id}`
}

export function createPostUrl(slug: string): string {
  return `/post/${slug}`
}

export function createPostUrlFromTitle(title: string, id: number): string {
  const slug = createPostSlug(title, id)
  return createPostUrl(slug)
}
