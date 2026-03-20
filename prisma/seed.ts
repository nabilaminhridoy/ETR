import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'
import { BANGLADESH_DISTRICTS } from '../src/lib/constants'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('Demo@1234', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'demo@gmail.com' },
    update: {},
    create: {
      email: 'demo@gmail.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
      isEmailVerified: true,
      isActive: true,
    },
  })

  console.log('Admin user created:', admin.email)

  // Create sample system settings
  const settings = [
    { key: 'site_name', value: 'EidTicketResell' },
    { key: 'site_currency', value: 'BDT' },
    { key: 'platform_fee_percentage', value: '1' },
    { key: 'minimum_platform_fee', value: '10' },
    { key: 'app_mode', value: 'development' },
    { key: 'contact_email', value: 'support@eidticketresell.com' },
    { key: 'contact_phone', value: '+880 1700-000000' },
    { key: 'address', value: 'Dhaka, Bangladesh' },
  ]

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  // Create payment gateways
  const gateways = [
    { name: 'bkash', isEnabled: true, isSandbox: true },
    { name: 'nagad', isEnabled: true, isSandbox: true },
    { name: 'uddoktapay', isEnabled: false, isSandbox: true },
    { name: 'piprapay', isEnabled: false, isSandbox: true },
  ]

  for (const gateway of gateways) {
    await prisma.paymentGateway.upsert({
      where: { name: gateway.name },
      update: gateway,
      create: gateway,
    })
  }

  // Create cities - All 64 districts of Bangladesh
  const cities = [...BANGLADESH_DISTRICTS]

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name: city },
      update: {},
      create: { name: city },
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
