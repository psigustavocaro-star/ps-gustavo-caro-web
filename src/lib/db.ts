import { PrismaClient } from '@prisma/client'

declare global {
    var prisma: undefined | PrismaClient
}

function getPrismaClient() {
    if (!globalThis.prisma) {
        globalThis.prisma = new PrismaClient()
    }
    return globalThis.prisma
}

// Export a proxy that lazily initializes Prisma
const prisma = new Proxy({} as PrismaClient, {
    get(target, prop) {
        const client = getPrismaClient()
        return (client as any)[prop]
    }
})

export default prisma
