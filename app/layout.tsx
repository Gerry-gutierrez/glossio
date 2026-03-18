import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'GlossIO — Auto Detailing Business Software',
    template: '%s | GlossIO',
  },
  description: 'Stop losing clients in the DMs. GlossIO helps auto detailers manage bookings, clients, and payments in one place.',
  keywords: ['auto detailing', 'booking software', 'detailer CRM', 'mobile detailing'],
  openGraph: {
    title: 'GlossIO — Auto Detailing Business Software',
    description: 'Stop losing clients in the DMs.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
