# Aviso de Privacidad — Nirium Protocol (borrador v2, LFPDPPP 2025)

> **BORRADOR — PENDIENTE DE REVISIÓN LEGAL.** Este documento NO está publicado
> en `/privacy`. El aviso en vivo (v1, actualizado 15-ago-2026) sigue siendo el
> vigente hasta que este borrador sea confirmado por el despacho externo. Se
> preparó como reemplazo completo, no como un parche, para que el abogado
> tenga un documento único que revisar en vez de un diff difícil de leer sobre
> el archivo `page.tsx` vivo.
>
> Qué cambió respecto al v1 vigente: el v1 ya cubre correctamente la reforma
> LFPDPPP 2025 (autoridad nueva, plazos, derechos ARCO) — esa parte se
> mantiene sin cambios de sustancia. Lo nuevo es la Sección 2b y el ajuste de
> la Sección 3: describir la telemetría de uso de `x402Serve()`, agregada el
> 18-ago-2026, que el v1 no menciona porque no existía cuando se escribió.

## 1. Identidad y domicilio del Responsable

"Nirium Protocol" (en adelante, el "Proyecto") es el nombre comercial bajo el
cual operan sus fundadores, quienes son responsables del tratamiento de los
datos personales que nos proporcione. El Proyecto es una herramienta de
software de código abierto y, a la fecha, no opera bajo una persona moral
constituida. Puede contactar a los responsables en el correo electrónico:
**niriumprotocol@gmail.com**.

## 2. Datos personales que se recaban de usuarios directos del sitio y del API

Para las finalidades señaladas en este aviso, podemos recabar los siguientes
datos de quienes usan directamente nuestro sitio o nuestro API (exclusivamente
para la infraestructura de software; no almacenamos datos financieros):

- API keys (almacenadas exclusivamente de forma hasheada, nunca en texto plano).
- URLs de webhooks para notificaciones del sistema.
- Métricas de uso del sistema e identificadores de red técnica.
- Direcciones públicas de Stellar (formato `G...`) cuando el usuario firma una
  transacción, un login social vía Pollar, o un atestiguamiento de auditoría.
  **Una dirección pública de Stellar es un identificador pseudónimo, no un
  dato biométrico ni un dato financiero sensible** — es la misma naturaleza
  que un número de cuenta público, y es la posición que este Proyecto ya
  sostiene consistentemente para los recibos de auditoría (`NiriumMainnet.md`
  §3.6): se ancla la dirección y el monto, nunca datos personales crudos.

**Importante:** No recabamos datos personales sensibles, datos biométricos, ni
tenemos custodia de fondos financieros en ningún momento. El software opera de
manera no custodial mediante firmas del cliente.

## 2b. Datos que se recaban de integradores terceros que instalan nuestro software (nuevo)

Desde el 18 de agosto de 2026, el paquete `nirium` (SDK) incluye una función,
`x402Serve()`, que un desarrollador externo instala en **su propio servidor**
para cobrar por su propia API usando el protocolo x402. Esa función envía, de
forma no bloqueante y opcional, un ping de telemetría a la infraestructura de
Nirium cuando procesa una solicitud con una llave de facilitador válida. Ese
ping puede contener:

- Una dirección pública de Stellar del integrador (`pay_to`), del mismo tipo
  descrito en la Sección 2.
- Un **hash SHA-256** de la llave de facilitador del integrador (emitida por
  OpenZeppelin, no por Nirium) — **nunca la llave en texto plano**.
- La red (`testnet`/`mainnet`), un conteo de rutas configuradas, un conteo de
  solicitudes procesadas, y la versión del paquete instalado.

**Este dato lo genera el software del integrador, no una visita de una persona
a nuestro sitio.** No incluye información de los usuarios finales del
integrador — Nirium nunca ve esas solicitudes, que ocurren enteramente en
infraestructura ajena. El único propósito de este dato es saber si el paquete
publicado se usa en producción; puede desactivarse por el integrador
estableciendo `NIRIUM_X402SERVE_TELEMETRY=false` en su propio entorno.

## 3. Finalidades del tratamiento

Los datos personales que recabamos serán utilizados exclusivamente para las
siguientes finalidades necesarias para el servicio que solicita:

- Autenticación de usuarios en la plataforma.
- Gestión y limitación de tasa (rate limiting) del API.
- Prestación del servicio técnico de software y envío de webhooks.
- Monitoreo de seguridad y prevención de abusos en el sistema.
- Medir la adopción real de las herramientas de software que publicamos
  (Sección 2b), para priorizar correctamente el trabajo de cumplimiento sobre
  esas herramientas en función de su uso efectivo, no de su existencia teórica.

## 4. Transferencias de datos personales

Le informamos que sus datos personales no son vendidos a terceros. Únicamente
se comparten con nuestros proveedores de infraestructura en la nube necesarios
para la operación del software (por ejemplo, Supabase para alojamiento de
bases de datos y Fly.io para infraestructura del agente) operando bajo
estrictos acuerdos de procesamiento de datos y confidencialidad.

## 5. Medios para limitar el uso o divulgación

Usted puede limitar el uso o divulgación de sus datos personales enviando su
solicitud al correo electrónico: **niriumprotocol@gmail.com**. Si usted es un
integrador que instaló `x402Serve()` y desea desactivar la telemetría descrita
en la Sección 2b sin contactarnos, puede hacerlo directamente estableciendo
`NIRIUM_X402SERVE_TELEMETRY=false` en su propio entorno — no requiere
solicitud.

## 6. Derechos ARCO y cómo ejercerlos

Usted tiene derecho a conocer qué datos personales tenemos de usted (Acceso).
Asimismo, es su derecho solicitar la corrección de su información personal si
está desactualizada, sea inexacta o incompleta (Rectificación); que la
eliminemos de nuestros registros (Cancelación); así como oponerse al uso de
sus datos personales para fines específicos (Oposición). Para ejercer
cualquiera de los derechos ARCO, deberá enviar la solicitud respectiva al
correo electrónico: **niriumprotocol@gmail.com**.

Responderemos a su solicitud en un plazo máximo de 20 días hábiles de
conformidad con la Ley Federal de Protección de Datos Personales en Posesión
de los Particulares (LFPDPPP), conforme a la reforma publicada en el Diario
Oficial de la Federación el 20 de marzo de 2025 (vigente desde el 21 de marzo
de 2025). A partir de dicha reforma, el Instituto Nacional de Transparencia,
Acceso a la Información y Protección de Datos Personales (INAI) fue
extinguido, y la autoridad garante en la materia es la Secretaría
Anticorrupción y Buen Gobierno.

## 7. Uso de cookies y tecnologías similares

Le informamos que en nuestra página de internet utilizamos cookies de sesión
exclusivamente para mantener la autenticación del usuario y garantizar el
funcionamiento de la plataforma. No utilizamos cookies de rastreo publicitario
ni píxeles de terceros con fines de marketing.

## 8. Cambios al aviso de privacidad

El presente aviso de privacidad puede sufrir modificaciones, cambios o
actualizaciones derivadas de nuevos requerimientos legales, de nuestras
propias necesidades por los servicios que ofrecemos, o por otras causas. Nos
comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el
presente aviso de privacidad, publicando la versión actualizada en esta misma
página.

---

## English Translation / Privacy Policy

*Note: This English translation is provided for convenience. In case of legal
dispute, the Spanish Aviso de Privacidad above, complying with Mexican
LFPDPPP, prevails.*

"Nirium Protocol" is the commercial name under which its founders operate;
they are responsible for the processing of personal data collected. The
Project is an open-source software tool and does not yet operate under an
incorporated legal entity.

We collect hashed API keys, webhook URLs, usage metrics, and public Stellar
addresses (`G...`) for authentication, rate limiting, and security purposes.
A public Stellar address is a pseudonymous identifier, not biometric or
sensitive financial data — the same position we already apply consistently to
audit receipts.

**New since 18-Aug-2026**: our published `nirium` SDK includes `x402Serve()`,
a function a third-party developer installs on **their own server** to charge
for their own API. It sends an optional, non-blocking telemetry ping that may
include the integrator's Stellar address, a SHA-256 hash of their facilitator
key (never the raw key), network, route/request counts, and SDK version. This
never includes data about the integrator's own end users — Nirium never sees
those requests, which happen entirely on infrastructure we do not operate.
Integrators can opt out by setting `NIRIUM_X402SERVE_TELEMETRY=false`.

We do not collect PII, sensitive data, biometrics, or financial data, nor do
we custody user funds. Data is only shared with essential infrastructure
providers (Supabase, Fly.io) under data processing agreements. We do not sell
data. We use essential session cookies only, no marketing tracking. You may
exercise your ARCO rights (Access, Rectification, Cancellation, Opposition) by
contacting **niriumprotocol@gmail.com**. We will respond within 20 business
days, per the LFPDPPP as amended on March 20, 2025 (in force since March 21,
2025) — under which Mexico's former data protection authority (INAI) was
dissolved and its functions transferred to the Secretaría Anticorrupción y
Buen Gobierno.
