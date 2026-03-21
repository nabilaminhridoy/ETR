import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { existsSync, unlink } from 'fs'
import path from 'path'

// Helper to verify admin auth
function getAdminFromRequest(request: NextRequest): { id: string; role: string } | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    
    // Handle both formats: userId:role:timestamp and userId:timestamp:role
    if (parts.length === 3) {
      const [userId, part2, part3] = parts
      // Check if part2 is a role (ADMIN or SUPER_ADMIN)
      if (part2 === 'ADMIN' || part2 === 'SUPER_ADMIN') {
        return { id: userId, role: part2 }
      }
      // Otherwise part3 is the role
      if (part3 === 'ADMIN' || part3 === 'SUPER_ADMIN') {
        return { id: userId, role: part3 }
      }
    }
    return null
  } catch {
    return null
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin auth
    const admin = getAdminFromRequest(request)
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get ticket to find associated files
    const ticket = await db.ticket.findUnique({
      where: { id },
      select: { ticketImage: true, ticketPdf: true },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Delete associated files
    const deleteFile = (fileUrl: string | null) => {
      if (fileUrl && fileUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', fileUrl)
        if (existsSync(filePath)) {
          try {
            unlink(filePath)
          } catch {
            // Ignore errors
          }
        }
      }
    }

    deleteFile(ticket.ticketImage)
    deleteFile(ticket.ticketPdf)

    // Delete ticket from database
    await db.ticket.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}
