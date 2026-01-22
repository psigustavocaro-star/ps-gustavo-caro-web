import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// In Prisma 7, if the schema doesn't have the URL, 
// we MUST provide it in the constructor via datasourceUrl or similar 
// depending on how the client was generated.
// However, the standard way in P7 with Next.js is:
const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
