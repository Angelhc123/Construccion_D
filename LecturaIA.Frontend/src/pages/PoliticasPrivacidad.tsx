import { Link } from 'react-router-dom';

export default function PoliticasPrivacidad() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Políticas de Privacidad y Protección de Datos</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Recopilación de Datos</h2>
            <p>
              LecturaIA recopila información personal limitada para brindar el servicio educativo de comprensión lectora.
              Los datos recopilados incluyen: correo electrónico, nombre completo, grado escolar (para estudiantes) y edad (para estudiantes).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Uso de la Información</h2>
            <p>
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Gestionar cuentas de usuario y autenticación</li>
              <li>Personalizar la experiencia educativa según el nivel del estudiante</li>
              <li>Comunicar actualizaciones importantes del sistema</li>
              <li>Mejorar nuestros servicios educativos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger sus datos personales
              contra acceso no autorizado, alteración, divulgación o destrucción. Las contraseñas se almacenan utilizando
              algoritmos de cifrado seguros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Compartir Información</h2>
            <p>
              No compartimos, vendemos ni alquilamos información personal a terceros. Los datos solo son accesibles
              para los docentes asignados a cada estudiante dentro del contexto educativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Derechos del Usuario</h2>
            <p>
              Los usuarios tienen derecho a:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Acceder a sus datos personales</li>
              <li>Solicitar la corrección de datos inexactos</li>
              <li>Solicitar la eliminación de su cuenta y datos asociados</li>
              <li>Retirar el consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies y Tecnologías de Seguimiento</h2>
            <p>
              Utilizamos cookies de sesión esenciales para el funcionamiento del sistema de autenticación.
              No utilizamos cookies de seguimiento con fines publicitarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Menores de Edad</h2>
            <p>
              El registro de estudiantes menores de edad debe ser supervisado por un tutor o docente autorizado.
              Los datos de menores son tratados con especial cuidado y protección adicional.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cambios en las Políticas</h2>
            <p>
              Nos reservamos el derecho de actualizar estas políticas. Los cambios significativos serán notificados
              a los usuarios registrados por correo electrónico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contacto</h2>
            <p>
              Para consultas sobre privacidad o ejercer sus derechos, puede contactarnos a través del correo
              electrónico del administrador del sistema.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
            <p>Última actualización: 11 de octubre de 2025</p>
            <p className="mt-2">
              Al registrarse en LecturaIA, usted acepta estas políticas de privacidad y el tratamiento de sus datos
              según lo descrito en este documento.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
