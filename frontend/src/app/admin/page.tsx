import { Metadata } from 'next'
import AdminDashboard from './AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Event management and visitor tracking'
}

export default function AdminPage() {
  return <AdminDashboard />
}