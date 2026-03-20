import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Page Not Found – EidTicketResell',
  },
}

export default function NotFoundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
