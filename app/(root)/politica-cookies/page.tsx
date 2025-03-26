/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Política de Cookies | BarkAndMeow",
  description: "Información sobre el uso de cookies en BarkAndMeow",
}

export default function PoliticaCookiesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>

      {/* Índice de contenidos */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <ul className="space-y-1">
            <li>
              <a href="#uso" className="text-primary hover:underline">
                a) Uso de cookies por parte de BarkAndMeow
              </a>
            </li>
            <li>
              <a href="#tipos" className="text-primary hover:underline">
                b) Tipos, finalidad y funcionamiento de las Cookies
              </a>
            </li>
            <li>
              <a href="#desactivar" className="text-primary hover:underline">
                c) Cómo desactivar las cookies en los principales navegadores
              </a>
            </li>
            <li>
              <a href="#consecuencias" className="text-primary hover:underline">
                d) ¿Qué sucede si desactivas las Cookies?
              </a>
            </li>
            <li>
              <a href="#cambios" className="text-primary hover:underline">
                e) Cambios en la política de cookies
              </a>
            </li>
            <li>
              <a href="#contacto" className="text-primary hover:underline">
                f) Contacto
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card id="uso" className="mb-6">
        <CardHeader>
          <CardTitle>a) Uso de cookies por parte de BarkAndMeow</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow utiliza "Cookies" y dispositivos similares (en adelante, Cookies). Las cookies son pequeños
            archivos de texto que se almacenan en tu dispositivo (ordenador, tablet, smartphone) cuando visitas nuestro
            sitio web. La primera finalidad de las cookies es proporcionar al Usuario un acceso rápido a los servicios
            seleccionados. Además, las Cookies personalizan los servicios ofrecidos por BarkAndMeow, facilitando y
            proporcionando a cada Usuario información que es o puede ser de su interés, en función del uso que hace de
            los servicios.
          </p>
          <p className="mt-2">
            BarkAndMeow utiliza Cookies para personalizar y facilitar la navegación del Usuario. Las cookies se asocian
            únicamente con un usuario anónimo y su ordenador y no proporcionan referencias que permitan revelar datos
            personales del Usuario. El Usuario puede configurar su navegador para que notifique y rechace la instalación
            de las cookies enviadas por BarkAndMeow sin que ello perjudique la posibilidad del Usuario de acceder a los
            Contenidos. No obstante, advertimos al Usuario que en estos casos, el rendimiento del sitio web puede verse
            perjudicado.
          </p>
          <p className="mt-2">
            Los usuarios que se registran o han iniciado sesión se benefician de servicios más personalizados y
            adaptados a su perfil, gracias a la combinación de los datos almacenados en las cookies con los datos
            personales utilizados en el momento del registro. Estos usuarios autorizan expresamente el uso de esta
            información con la finalidad indicada, sin perjuicio de su derecho a rechazar o deshabilitar las cookies.
          </p>
        </CardContent>
      </Card>

      <Card id="tipos" className="mb-6">
        <CardHeader>
          <CardTitle>b) Tipos, finalidad y funcionamiento de las Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            En cuanto a su permanencia, las Cookies se pueden dividir en Cookies de sesión o Cookies permanentes. Las
            primeras caducan cuando el Usuario cierra el navegador. Las segundas caducan una vez que han alcanzado el
            objetivo para el que fueron creadas o cuando se eliminan manualmente.
          </p>
          <p className="mt-2">
            Adicionalmente y dependiendo de su objetivo, las Cookies se pueden clasificar de la siguiente manera:
          </p>

          <h3 className="font-semibold text-lg mt-4">Cookies necesarias</h3>
          <p className="mt-1">
            Son esenciales para que puedas navegar por nuestra web y utilizar sus funciones básicas. Estas cookies no
            recogen información sobre ti que pueda ser utilizada con fines publicitarios ni recuerdan por dónde has
            navegado en internet. Sin estas cookies, no podríamos proporcionar los servicios que has solicitado, como el
            acceso a áreas seguras de la web.
          </p>

          <h3 className="font-semibold text-lg mt-4">Cookies analíticas</h3>
          <p className="mt-1">
            Nos permiten reconocer y contar el número de visitantes y ver cómo se mueven por nuestra web. Esto nos ayuda
            a mejorar el funcionamiento de nuestra web, por ejemplo, asegurándonos de que los usuarios encuentren
            fácilmente lo que buscan.
          </p>

          <h3 className="font-semibold text-lg mt-4">Cookies de marketing</h3>
          <p className="mt-1">
            Se utilizan para rastrear a los visitantes en las webs. La intención es mostrar anuncios relevantes y
            atractivos para el usuario individual, y por lo tanto, más valiosos para los editores y terceros
            anunciantes.
          </p>

          <h3 className="font-semibold text-lg mt-4">Cookies de preferencias</h3>
          <p className="mt-1">
            Permiten que nuestra web recuerde información que cambia el aspecto o el comportamiento de la web, como tu
            idioma preferido o la región en la que te encuentras.
          </p>
        </CardContent>
      </Card>

      <Card id="desactivar" className="mb-6">
        <CardHeader>
          <CardTitle>c) Cómo desactivar las cookies en los principales navegadores</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Normalmente, puede impedir que un navegador acepte Cookies o dejar de aceptar cookies de un Servicio en
            particular. Todos los navegadores modernos le permiten cambiar la configuración de las Cookies.
          </p>
          <p className="mt-2">
            Estas configuraciones generalmente se encuentran en el menú 'Opciones' o 'Preferencias' de su navegador. A
            continuación, te ofrecemos enlaces sobre cómo gestionar las cookies en los navegadores más populares:
          </p>
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
        </CardContent>
      </Card>

      <Card id="consecuencias" className="mb-6">
        <CardHeader>
          <CardTitle>d) ¿Qué sucede si desactivas las Cookies?</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Si desactivas las cookies, algunas funcionalidades de nuestra web podrían verse afectadas. Por ejemplo:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>No podrás mantener tu sesión iniciada entre visitas</li>
            <li>Algunas preferencias personalizadas podrían perderse</li>
            <li>Ciertas funcionalidades interactivas podrían no funcionar correctamente</li>
            <li>Algunas áreas de la web podrían no estar disponibles o no funcionar adecuadamente</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="cambios" className="mb-6">
        <CardHeader>
          <CardTitle>e) Cambios en la política de cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Es posible que actualicemos nuestra Política de Cookies para adaptarla a cambios en la legislación o en
            nuestros servicios. Por este motivo, te recomendamos que revises esta política cada vez que accedas a
            nuestra web para estar adecuadamente informado sobre cómo y para qué utilizamos las cookies.
          </p>
        </CardContent>
      </Card>

      <Card id="contacto" className="mb-6">
        <CardHeader>
          <CardTitle>f) Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Si tienes alguna pregunta, comentario o sugerencia sobre nuestra Política de Cookies, puedes contactar con
            el desarrollador a través de:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              WhatsApp:{" "}
              <a href="https://wa.me/34649599475" className="text-primary hover:underline">
                Contactar por WhatsApp
              </a>
            </li>
            <li>
              Telegram:{" "}
              <a href="https://t.me/BarkAndMeowApp" className="text-primary hover:underline">
                @BarkAndMeowApp
              </a>
            </li>
          </ul>

          <p className="mt-4">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

