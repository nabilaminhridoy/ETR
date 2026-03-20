import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Email Templates API - Updated
// GET - Fetch all email templates or by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // 'admin' or 'user'
    const name = searchParams.get('name') // specific template name
    
    if (name) {
      // Use raw query to bypass Turbopack cache
      const templates = await db.$queryRaw`
        SELECT id, name, displayName, category, subject, title, body, 
               footerText, copyrightText, variables, isActive, createdAt, updatedAt
        FROM EmailTemplate 
        WHERE name = ${name}
      `
      const template = Array.isArray(templates) && templates.length > 0 ? templates[0] : null
      return NextResponse.json({ template }, { 
        headers: { 'Cache-Control': 'no-store' }
      })
    }
    
    // Use raw query to bypass Turbopack cache
    let query
    if (category) {
      query = db.$queryRaw`
        SELECT id, name, displayName, category, subject, title, body, 
               footerText, copyrightText, variables, isActive, createdAt, updatedAt
        FROM EmailTemplate 
        WHERE category = ${category}
        ORDER BY name ASC
      `
    } else {
      query = db.$queryRaw`
        SELECT id, name, displayName, category, subject, title, body, 
               footerText, copyrightText, variables, isActive, createdAt, updatedAt
        FROM EmailTemplate 
        ORDER BY name ASC
      `
    }
    
    const templates = await query

    return NextResponse.json({ templates }, { 
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 })
  }
}

// POST - Create or update email template
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, displayName, category, subject, title, body, footerText, copyrightText, variables } = data

    if (!name || !subject || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use raw query for upsert to bypass Turbopack cache
    const now = new Date().toISOString()
    await db.$executeRaw`
      INSERT INTO EmailTemplate (id, name, displayName, category, subject, title, body, footerText, copyrightText, variables, isActive, createdAt, updatedAt)
      VALUES (${Prisma.raw(`'${Date.now().toString(36)}'`)}, ${name}, ${displayName || name}, ${category || 'user'}, ${subject}, ${title}, ${body}, ${footerText || null}, ${copyrightText || null}, ${variables || null}, 1, ${now}, ${now})
      ON CONFLICT(name) DO UPDATE SET
        displayName = ${displayName || name},
        category = ${category || 'user'},
        subject = ${subject},
        title = ${title},
        body = ${body},
        footerText = ${footerText || null},
        copyrightText = ${copyrightText || null},
        variables = ${variables || null},
        updatedAt = ${now}
    `

    // Fetch the updated template
    const templates = await db.$queryRaw`
      SELECT id, name, displayName, category, subject, title, body, 
             footerText, copyrightText, variables, isActive, createdAt, updatedAt
      FROM EmailTemplate 
      WHERE name = ${name}
    `
    const template = Array.isArray(templates) && templates.length > 0 ? templates[0] : null

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Error saving email template:', error)
    return NextResponse.json({ error: 'Failed to save email template' }, { status: 500 })
  }
}

// DELETE - Delete email template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    await db.$executeRaw`
      DELETE FROM EmailTemplate WHERE name = ${name}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 })
  }
}
