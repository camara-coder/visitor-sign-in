import '../styles/primereact-overrides.css';  // First - our overrides
import 'primereact/resources/themes/lara-light-blue/theme.css';  // theme
import 'primereact/resources/primereact.min.css';               // core css
import 'primeicons/primeicons.css';                            // icons
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Visitor Sign-in System',
  description: 'Sign in to the event',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}