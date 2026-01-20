# Guía de Integración de Pagos y Facturación

## Resumen del Sistema

Este sistema integra:
1. **Flow** - Pasarela de pagos chilena (Webpay, tarjetas)
2. **Bsale** - Facturación electrónica automática (boletas de honorarios)
3. **Emails automáticos** - Confirmación de cita + boleta adjunta

---

## 1. Configuración de Flow (Pagos)

### Paso 1: Crear cuenta en Flow
1. Ir a [flow.cl](https://www.flow.cl) y registrarte como comercio
2. Completar validación de identidad (RUT, cuenta bancaria, etc.)
3. Esperar aprobación (1-3 días hábiles)

### Paso 2: Obtener credenciales
1. Acceder al [Panel de Flow](https://www.flow.cl/app/web/panel.php)
2. Ir a **Configuración > Credenciales**
3. Copiar `apiKey` y `secretKey`

### Paso 3: Configurar en `.env.local`
```env
FLOW_API_KEY=your_api_key
FLOW_SECRET_KEY=your_secret_key
FLOW_API_URL=https://www.flow.cl/api
```

### Modo Sandbox (desarrollo)
Para pruebas, usar:
```env
FLOW_API_URL=https://sandbox.flow.cl/api
```

---

## 2. Configuración de Bsale (Facturación)

### Paso 1: Crear cuenta en Bsale
1. Ir a [bsale.cl](https://www.bsale.cl) y solicitar demo/registro
2. Configurar tu información tributaria (RUT, giro, etc.)
3. Habilitar boletas electrónicas

### Paso 2: Obtener Access Token
1. Acceder al panel de Bsale
2. Ir a **Configuración > Integraciones > API**
3. Generar y copiar el Access Token

### Paso 3: Configurar en `.env.local`
```env
BSALE_ACCESS_TOKEN=your_access_token
EMISOR_RUT=12.345.678-9
```

---

## 3. Flujo de Pago Completo

```
Usuario completa formulario
         ↓
POST /api/payments/create
         ↓
Se crea orden en Flow
         ↓
Usuario es redirigido a Flow para pagar
         ↓
Usuario completa pago (Webpay/Tarjeta)
         ↓
Flow llama POST /api/payments/flow/confirm (webhook)
         ↓
Sistema verifica pago exitoso
         ↓
Se genera boleta automáticamente en Bsale
         ↓
Se envía email con:
  - Confirmación de cita
  - Link de videollamada
  - Boleta adjunta (PDF)
         ↓
Usuario es redirigido a /pago/exito
```

---

## 4. Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `src/lib/config/services.ts` | Configuración de todos los servicios |
| `src/lib/services/flow.ts` | Servicio de pagos Flow |
| `src/lib/services/invoice.ts` | Servicio de facturación |
| `src/app/api/payments/create/route.ts` | API para iniciar pago |
| `src/app/api/payments/flow/confirm/route.ts` | Webhook de confirmación |
| `src/app/pago/exito/page.tsx` | Página de éxito |

---

## 5. Precios Configurados

| Servicio | Precio CLP |
|----------|------------|
| Sesión Individual | $45.000 |
| Plan Mensual (4 sesiones) | $115.000 |
| Evaluación Neuropsicológica | $80.000 |

Para modificar precios, editar `src/lib/config/services.ts`

---

## 6. Alternativas a Bsale

Si prefieres otro proveedor de facturación:

- **Facele**: Similar a Bsale, buena API
- **Nubox**: Más completo pero más complejo
- **SII Directo**: Requiere certificado digital, más complejo

Para cambiar proveedor, modificar `invoiceConfig.provider` en `services.ts`

---

## 7. Testing

### Tarjetas de prueba Flow Sandbox:
- **Visa**: 4051 8856 0044 6623, CVV: 123, Exp: 12/25
- **Mastercard**: 5186 0595 5959 0568, CVV: 123, Exp: 12/25

### RUT de prueba:
- 11.111.111-1 (siempre aprobado)
- 22.222.222-2 (siempre rechazado)

---

## 8. Checklist para Producción

- [ ] Cambiar `FLOW_API_URL` a producción
- [ ] Configurar dominio real en `NEXT_PUBLIC_BASE_URL`
- [ ] Verificar certificado SSL activo
- [ ] Configurar webhook URL en panel de Flow
- [ ] Probar flujo completo con pago real
- [ ] Verificar emisión de boletas en SII
