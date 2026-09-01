// ✅ FILE PATH: src/app/contact/page.tsx
import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact Kavalakat | Steel & Cement Supplier Branches in Kerala',
  description:
    'Get in touch with Kavalakat for TMT steel, cement, paints and construction material orders. Branches in Thrissur, Palakkad, Ernakulam & more.',
}

export default function ContactPage() {
  return <ContactPageClient />
}