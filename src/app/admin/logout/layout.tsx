import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Admin Logout – EidTicketResell',
  },
}

export default function AdminLogoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
