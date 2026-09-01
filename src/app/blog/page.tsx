// ✅ FILE PATH: src/app/blog/page.tsx
import type { Metadata } from 'next'
import BlogGridClient from './BlogGridClient'

export const metadata: Metadata = {
  title: 'Blog | Construction Industry Insights by Kavalakat',
  description:
    "Read Kavalakat's blog for steel & cement market trends, construction material insights, and industry updates for builders across Kerala.",
}

export default function BlogPage() {
  return <BlogGridClient />
}