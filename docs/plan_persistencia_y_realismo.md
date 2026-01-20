## 1. Persistencia de Datos (Base de Datos)
Utilizaremos **Prisma** con **SQLite** para guardar toda la información localmente de manera segura.

### Tareas:
- [x] **Instalar dependencias**: `prisma` y `@prisma/client`.
- [x] **Inicializar Prisma**: `npx prisma init --datasource-provider sqlite`.
- [ ] **Definir Esquema Prisma**: Crear los modelos `Booking` y `Anamnesis` en `prisma/schema.prisma`.
- [ ] **Migración Inicial**: Ejecutar `npx prisma migrate dev` para crear la base de datos `dev.db`.
- [ ] **Servicio de Base de Datos**: Crear un cliente de Prisma en `src/lib/db.ts`.
- [ ] **Actualizar APIs**:
    - `POST /api/payments/create`: Guardar el intento de agendamiento.
    - `POST /api/payments/flow/confirm`: Actualizar el estado del pago a "CONFIRMADO".
    - `POST /api/anamnesis`: Guardar la ficha clínica.

## 2. Páginas Legales y Funcionales (Footer)
Crearemos todas las páginas enlazadas en el footer para que el sitio sea 100% real.

### Tareas:
- [ ] **Crear Página Aviso Legal**: `/aviso-legal`.
- [ ] **Crear Página Política de Privacidad**: `/privacidad`.
- [ ] **Crear Página Política de Cookies**: `/cookies`.
- [ ] **Diseño Consistente**: Usar un layout limpio y profesional para estas páginas informativas.

## 3. Mejora de Testimonios (Realismo)
Generaremos nuevas imágenes con un estilo "foto de calle" o "selfie casual".

### Tareas:
- [ ] **Generar Imágenes**: (Reintentar) Usar `generate_image` con prompts de personas casuales en Santiago.
- [ ] **Actualizar Assets**: Reemplazar archivos en `public/images/testimonio-X.png`.

## 3. Flujo de Pago y Agendamiento
- El agendamiento se genera cuando se valida el pago en el Webhook de Flow.
- La anamnesis se asocia al email del paciente para mantener el historial clínico.

¿Deseas que proceda con este plan?
