import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

/**
 * Generate the next sequential ticket ID
 * Format: TKT-XXXX (starts from TKT-1001)
 * 
 * This function is transaction-safe and handles concurrent requests.
 * Uses database-level atomic operations to prevent duplicate IDs.
 */
export async function generateTicketId(): Promise<string> {
  // Use a transaction to ensure atomicity
  const result = await db.$transaction(async (tx) => {
    // Get or create the counter
    let counter = await tx.ticketCounter.findUnique({
      where: { id: 'ticket_counter' }
    })

    if (!counter) {
      // Create counter with starting value 1000 (first ticket will be 1001)
      counter = await tx.ticketCounter.create({
        data: {
          id: 'ticket_counter',
          lastNumber: 1000
        }
      })
    }

    // Increment the counter atomically
    const updatedCounter = await tx.ticketCounter.update({
      where: { id: 'ticket_counter' },
      data: { lastNumber: { increment: 1 } }
    })

    return updatedCounter.lastNumber
  })

  // Format: TKT-1001, TKT-1002, etc.
  // Handles expansion: TKT-9999 -> TKT-10000 -> TKT-10001
  return `TKT-${result}`
}

/**
 * Validate ticket ID format
 * Must match: TKT-XXXX where X is a digit
 */
export function isValidTicketId(ticketId: string): boolean {
  return /^TKT-\d+$/.test(ticketId)
}

/**
 * Parse ticket ID to get the numeric part
 */
export function parseTicketNumber(ticketId: string): number | null {
  const match = ticketId.match(/^TKT-(\d+)$/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Get current ticket counter (for admin/debug purposes)
 */
export async function getCurrentTicketCounter(): Promise<number> {
  const counter = await db.ticketCounter.findUnique({
    where: { id: 'ticket_counter' }
  })
  return counter?.lastNumber ?? 1000
}

/**
 * Reset ticket counter (admin only - use with caution)
 * This should only be used during initial setup or testing
 */
export async function resetTicketCounter(startNumber: number = 1000): Promise<void> {
  await db.ticketCounter.upsert({
    where: { id: 'ticket_counter' },
    update: { lastNumber: startNumber },
    create: { id: 'ticket_counter', lastNumber: startNumber }
  })
}
