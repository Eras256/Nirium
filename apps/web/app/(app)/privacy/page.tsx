import type { Metadata } from "next";
import { Shield, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | Privacy Policy — Nirium Protocol",
  description: "Aviso de privacidad y política de protección de datos personales aplicable al uso de Nirium Protocol.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 bg-black text-zinc-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] font-mono text-zinc-300 mb-6 uppercase tracking-widest">
            <Shield className="w-3 h-3" /> Data Privacy / LFPDPPP
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Aviso de Privacidad
          </h1>
          <p className="text-sm font-mono text-zinc-500">Última actualización / Last updated: 13 de julio de 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">1. Identidad y domicilio del Responsable</h2>
          <p>"Nirium Protocol" (en adelante, el "Proyecto") es el nombre comercial bajo el cual operan sus fundadores, quienes son responsables del tratamiento de los datos personales que nos proporcione. El Proyecto es una herramienta de software de código abierto y, a la fecha, no opera bajo una persona moral constituida. Puede contactar a los responsables en el correo electrónico: <strong>niriumprotocol@gmail.com</strong>.</p>

          <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">2. Datos personales que se recaban</h2>
          <p>Para las finalidades señaladas en el presente aviso, podemos recabar los siguientes datos (exclusivamente para la infraestructura de software, no almacenamos datos financieros):</p>
          <ul>
            <li>API keys (las cuales se almacenan exclusivamente de forma hasheada, nunca en texto plano).</li>
            <li>URLs de webhooks para notificaciones del sistema.</li>
            <li>Métricas de uso del sistema e identificadores de red técnica.</li>
          </ul>
          <p><strong>Importante:</strong> No recabamos datos personales sensibles, datos biométricos, ni tenemos custodia de fondos financieros en ningún momento. El software opera de manera no custodial mediante firmas del cliente.</p>

          <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">3. Finalidades del tratamiento</h2>
          <p>Los datos personales que recabamos serán utilizados exclusivamente para las siguientes finalidades necesarias para el servicio que solicita:</p>
          <ul>
            <li>Autenticación de usuarios en la plataforma.</li>
            <li>Gestión y limitación de tasa (rate limiting) del API.</li>
            <li>Prestación del servicio técnico de software y envío de webhooks.</li>
            <li>Monitoreo de seguridad y prevención de abusos en el sistema.</li>
          </ul>

          <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">4. Transferencias de datos personales</h2>
          <p>Le informamos que sus datos personales no son vendidos a terceros. Únicamente se comparten con nuestros proveedores de infraestructura en la nube necesarios para la operación del software (por ejemplo, Supabase para alojamiento de bases de datos y Fly.io para infraestructura del agente) operando bajo estrictos acuerdos de procesamiento de datos y confidencialidad.</p>

          <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">5. Medios para limitar el uso o divulgación</h2>
          <p>Usted puede limitar el uso o divulgación de sus datos personales enviando su solicitud al correo electrónico: <strong>niriumprotocol@gmail.com</strong>.</p>

          <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">6. Derechos ARCO y cómo ejercerlos</h2>
          <p>Usted tiene derecho a conocer qué datos personales tenemos de usted (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal si está desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Para ejercer cualquiera de los derechos ARCO, deberá enviar la solicitud respectiva al correo electrónico: <strong>niriumprotocol@gmail.com</strong>.</p>
          <p>Responderemos a su solicitud en un plazo máximo de 20 días hábiles de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>

          <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">7. Uso de cookies y tecnologías similares</h2>
          <p>Le informamos que en nuestra página de internet utilizamos cookies de sesión exclusivamente para mantener la autenticación del usuario y garantizar el funcionamiento de la plataforma. No utilizamos cookies de rastreo publicitario ni píxeles de terceros con fines de marketing.</p>

          <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">8. Cambios al aviso de privacidad</h2>
          <p>El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de nuestras propias necesidades por los servicios que ofrecemos, o por otras causas. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad, publicando la versión actualizada en esta misma página.</p>

          <hr className="my-16 border-white/10" />
          
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-400" />
              English Translation / Privacy Policy
            </h2>
            <p className="text-sm"><em>Note: This English translation is provided for convenience. In case of legal dispute, the Spanish Aviso de Privacidad above, complying with Mexican LFPDPPP, prevails.</em></p>
            <p className="text-sm mt-4">"Nirium Protocol" is the commercial name under which its founders operate; they are responsible for the processing of personal data collected. The Project is an open-source software tool and does not yet operate under an incorporated legal entity. We only collect hashed API keys, webhook URLs, and usage metrics for authentication, rate limiting, and security purposes. We do not collect PII, sensitive data, biometrics, or financial data, nor do we custody user funds.</p>
            <p className="text-sm mt-2">Data is only shared with essential infrastructure providers (Supabase, Fly.io) under data processing agreements. We do not sell data. We use essential session cookies only, no marketing tracking. You may exercise your ARCO rights (Access, Rectification, Cancellation, Opposition) by contacting <strong>niriumprotocol@gmail.com</strong>. We will respond within 20 business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
