import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Maintenance Mode – EidTicketResell',
  },
}

export default function MaintenanceModeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
