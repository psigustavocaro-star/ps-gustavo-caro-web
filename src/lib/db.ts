import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Inicialización lazy para evitar errores en build
const getPrisma = () => {
    if (!globalThis.prisma) {
        globalThis.prisma = new PrismaClient({
            datasourceUrl: process.env.DATABASE_URL
        })
    }
    return globalThis.prisma
}

const prisma = getPrisma()

export default prisma
