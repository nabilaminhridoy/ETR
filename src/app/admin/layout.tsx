import { Metadata } from 'next'
import AdminClientLayout from './AdminClientLayout'

export const metadata: Metadata = {
  title: {
    absolute: 'Admin Panel – EidTicketResell',
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>
}
