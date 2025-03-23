export const metadata = {
    title: "Política de Cookies | BarkAndMeow",
    description: "Información sobre el uso de cookies en BarkAndMeow",
  }
  
  export default function PoliticaCookiesPage() {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>
  
          <div className="prose dark:prose-invert max-w-none">
            <p>
              En BarkAndMeow utilizamos cookies propias y de terceros para mejorar tu experiencia de navegación y
              ofrecerte contenido personalizado. A continuación, te explicamos qué son las cookies, cómo las utilizamos y
              cómo puedes configurar tus preferencias.
            </p>
  
            <h2 className="text-2xl font-semibold mt-8 mb-4">¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet,
              smartphone) cuando visitas un sitio web. Estas cookies nos permiten reconocerte y recordar tus preferencias,
              analizar el uso que haces de nuestra web, personalizar el contenido que te mostramos y, en algunos casos,
              mostrarte publicidad basada en tus hábitos de navegación.
            </p>
  
            <h2 className="text-2xl font-semibold mt-8 mb-4">Tipos de cookies que utilizamos</h2>
  
            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies necesarias</h3>
            <p>
              Son esenciales para que puedas navegar por nuestra web y utilizar sus funciones básicas. Estas cookies no
              recogen información sobre ti que pueda ser utilizada con fines publicitarios ni recuerdan por dónde has
              navegado en internet. Sin estas cookies, no podríamos proporcionar los servicios que has solicitado, como el
              acceso a áreas seguras de la web o el carrito de compra.
            </p>
  
            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies analíticas</h3>
            <p>
              Nos permiten reconocer y contar el número de visitantes y ver cómo se mueven por nuestra web. Esto nos ayuda
              a mejorar el funcionamiento de nuestra web, por ejemplo, asegurándonos de que los usuarios encuentren
              fácilmente lo que buscan.
            </p>
  
            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies de marketing</h3>
            <p>
              Se utilizan para rastrear a los visitantes en las webs. La intención es mostrar anuncios relevantes y
              atractivos para el usuario individual, y por lo tanto, más valiosos para los editores y terceros
              anunciantes.
            </p>
  
            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies de preferencias</h3>
            <p>
              Permiten que nuestra web recuerde información que cambia el aspecto o el comportamiento de la web, como tu
              idioma preferido o la región en la que te encuentras.
            </p>
  
            <h2 className="text-2xl font-semibold mt-8 mb-4">¿Cómo puedes gestionar las cookies?</h2>
            <p>
              Puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo a través de la configuración
              de las opciones de tu navegador de internet. En caso de que no permitas la instalación de cookies en tu
              navegador es posible que no puedas acceder a algunas de las funcionalidades de nuestra web.
            </p>
            <p>A continuación, te ofrecemos enlaces sobre cómo gestionar las cookies en los navegadores más populares:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>
  
            <h2 className="text-2xl font-semibold mt-8 mb-4">Cambios en la política de cookies</h2>
            <p>
              Es posible que actualicemos nuestra Política de Cookies para adaptarla a cambios en la legislación o en
              nuestros servicios. Por este motivo, te recomendamos que revises esta política cada vez que accedas a
              nuestra web para estar adecuadamente informado sobre cómo y para qué utilizamos las cookies.
            </p>
  
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contacto</h2>
            <p>
              Si tienes alguna pregunta, comentario o sugerencia sobre nuestra Política de Cookies, puedes contactar con
              el desarrollador a través de:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>
                WhatsApp:{" "}
                <a href="https://wa.me/34649599475" className="text-primary hover:underline">
                  Contactar por WhatsApp
                </a>{" "}
                (reemplaza TUNUMERO con tu número incluyendo el código de país, ej: 34612345678)
              </li>
              <li>
                Telegram:{" "}
                <a href="https://t.me/TUUSUARIO" className="text-primary hover:underline">
                  @TUUSUARIO
                </a>{" "}
                (reemplaza TUUSUARIO con tu nombre de usuario de Telegram)
              </li>
            </ul>
  
            <p className="mt-8">
              Última actualización:{" "}
              {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  