import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Payment Cancelled – EidTicketResell',
  },
}

export default function PaymentCancelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
