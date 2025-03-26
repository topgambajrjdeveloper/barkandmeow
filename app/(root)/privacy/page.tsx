/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Política de Privacidad | BarkAndMeow",
  description: "Información sobre nuestra política de privacidad y tratamiento de datos personales",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

      {/* Índice de contenidos */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <ul className="space-y-1">
            <li>
              <a href="#intro" className="text-primary hover:underline">
                a) Introducción
              </a>
            </li>
            <li>
              <a href="#identity" className="text-primary hover:underline">
                b) Identidad y datos de contacto del Responsable
              </a>
            </li>
            <li>
              <a href="#collection" className="text-primary hover:underline">
                c) Recopilación de información
              </a>
            </li>
            <li>
              <a href="#location" className="text-primary hover:underline">
                d) Datos de ubicación y geolocalización
              </a>
            </li>
            <li>
              <a href="#purpose" className="text-primary hover:underline">
                e) Finalidad y uso de la información
              </a>
            </li>
            <li>
              <a href="#sharing" className="text-primary hover:underline">
                f) Compartir información
              </a>
            </li>
            <li>
              <a href="#security" className="text-primary hover:underline">
                g) Seguridad de datos
              </a>
            </li>
            <li>
              <a href="#children" className="text-primary hover:underline">
                h) Niños
              </a>
            </li>
            <li>
              <a href="#cookies" className="text-primary hover:underline">
                i) Cookies
              </a>
            </li>
            <li>
              <a href="#control" className="text-primary hover:underline">
                j) Control de sus datos
              </a>
            </li>
            <li>
              <a href="#rights" className="text-primary hover:underline">
                k) Derechos
              </a>
            </li>
            <li>
              <a href="#changes" className="text-primary hover:underline">
                l) Cambios en esta política
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card id="intro" className="mb-6">
        <CardHeader>
          <CardTitle>a) Introducción</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            La presente Política de Privacidad tiene como objetivo regular el tratamiento de datos personales que
            realiza BarkAndMeow a través de su plataforma y aplicaciones. BarkAndMeow se compromete a proteger su
            privacidad en línea y a manejar su información personal con el máximo cuidado y confidencialidad.
          </p>
          <p className="mt-2">
            Por favor, lea atentamente esta política para comprender cómo recopilamos, utilizamos y protegemos su
            información personal. Al utilizar o acceder a nuestros servicios, usted acepta esta Política de Privacidad.
          </p>
          <p className="mt-2">
            Esta política se aplica únicamente a la información recopilada a través de BarkAndMeow, y no se aplica a la
            información recopilada a través de sitios web de terceros o aplicaciones que pueden redirigirse a nuestro
            sitio o a los que se puede acceder desde nuestra plataforma.
          </p>
        </CardContent>
      </Card>

      <Card id="identity" className="mb-6">
        <CardHeader>
          <CardTitle>b) Identidad y datos de contacto del Responsable</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            De conformidad con la normativa aplicable en materia de protección de datos personales, BarkAndMeow es el
            responsable del tratamiento de los datos personales facilitados a través de los formularios online
            disponibles en nuestra plataforma.
          </p>
          <p className="mt-2">
            Si tiene alguna pregunta sobre la protección de datos, puede ponerse en contacto con nosotros a través de:
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
              </a>{" "}</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="collection" className="mb-6">
        <CardHeader>
          <CardTitle>c) Recopilación de información</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow recopila información personal que usted nos proporciona directamente, como su nombre, dirección
            de correo electrónico y detalles sobre sus mascotas. También podemos recopilar información sobre su uso de
            nuestros servicios.
          </p>
          <p className="mt-2">La información que recopilamos puede incluir:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Información de registro (nombre, correo electrónico, contraseña)</li>
            <li>Información de perfil (foto, descripción, preferencias)</li>
            <li>Información sobre sus mascotas (nombre, tipo, raza, edad, fotos)</li>
            <li>Datos de ubicación (si usted lo autoriza)</li>
            <li>Información sobre su actividad en la plataforma</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="location" className="mb-6">
        <CardHeader>
          <CardTitle>d) Datos de ubicación y geolocalización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              BarkAndMeow puede solicitar acceso a su ubicación geográfica para mejorar su experiencia en nuestra
              plataforma, mostrándole mascotas y usuarios cercanos a su ubicación.
            </p>

            <h3 className="font-semibold text-lg mt-4">Consideraciones importantes sobre la geolocalización:</h3>

            <div className="pl-4 border-l-2 border-primary/20 mt-2">
              <h4 className="font-medium">1. Privacidad y transparencia</h4>
              <p className="text-sm mt-1 mb-3">
                Siempre le informaremos cuando recopilemos datos de ubicación y para qué los utilizaremos. Nunca
                recopilaremos su ubicación sin su conocimiento o consentimiento explícito. Puede revocar este permiso en
                cualquier momento a través de la configuración de su navegador o dispositivo.
              </p>

              <h4 className="font-medium">2. Precisión vs. Intrusión</h4>
              <p className="text-sm mt-1 mb-3">
                Los métodos de geolocalización más precisos (como el GPS) requieren más permisos y pueden ser más
                intrusivos. Le ofrecemos diferentes opciones de precisión:
              </p>
              <ul className="list-disc pl-6 text-sm mb-3">
                <li>Alta precisión (GPS): Para encontrar mascotas muy cercanas a su ubicación exacta</li>
                <li>Precisión media (WiFi/red): Balance entre precisión y privacidad</li>
                <li>Baja precisión (basada en IP): Menor precisión pero mayor privacidad</li>
              </ul>
              <p className="text-sm mb-3">Usted decide qué nivel de precisión desea compartir según sus necesidades.</p>

              <h4 className="font-medium">3. Límites de uso</h4>
              <p className="text-sm mt-1 mb-3">
                Utilizamos servicios gratuitos de geolocalización que tienen límites en el número de solicitudes. En
                caso de alcanzar estos límites, es posible que algunas funciones de localización no estén disponibles
                temporalmente. Trabajamos constantemente para optimizar nuestro uso de estos servicios y minimizar
                cualquier interrupción.
              </p>

              <h4 className="font-medium">4. Almacenamiento en caché</h4>
              <p className="text-sm mt-1 mb-3">
                Para reducir el número de solicitudes a servicios de geolocalización y mejorar el rendimiento,
                almacenamos temporalmente (en caché) los resultados de geolocalización. Esto significa que:
              </p>
              <ul className="list-disc pl-6 text-sm">
                <li>Su ubicación aproximada puede almacenarse localmente en su dispositivo</li>
                <li>Podemos guardar temporalmente su ciudad o región en nuestros servidores</li>
                <li>Las coordenadas GPS precisas no se almacenan permanentemente</li>
                <li>Puede borrar estos datos en cualquier momento desde su perfil</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="purpose" className="mb-6">
        <CardHeader>
          <CardTitle>e) Finalidad y uso de la información</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, así como para
            comunicarnos con usted sobre actualizaciones, ofertas y eventos relacionados con BarkAndMeow.
          </p>
          <p className="mt-2">Los datos de ubicación se utilizan específicamente para:</p>
          <ul className="list-disc pl-6 mt-1">
            <li>Mostrar mascotas y usuarios cercanos a su ubicación</li>
            <li>Recomendar eventos para mascotas en su área</li>
            <li>Proporcionar información sobre servicios veterinarios y tiendas cercanas</li>
            <li>Facilitar encuentros entre mascotas en parques o áreas comunes</li>
          </ul>
          <p className="mt-2">
            La base legal para el tratamiento de sus datos es el consentimiento que usted otorga al registrarse y
            utilizar nuestra plataforma, así como el interés legítimo en proporcionarle un servicio de calidad y
            personalizado.
          </p>
        </CardContent>
      </Card>

      <Card id="sharing" className="mb-6">
        <CardHeader>
          <CardTitle>f) Compartir información</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            No vendemos ni compartimos su información personal con terceros, excepto en los casos descritos en esta
            política o con su consentimiento explícito.
          </p>
          <p className="mt-2">
            Sus datos de ubicación precisa nunca se comparten con otros usuarios sin su autorización. Otros usuarios
            solo pueden ver su ubicación aproximada (como su ciudad o barrio) si usted lo permite en su configuración de
            privacidad.
          </p>
        </CardContent>
      </Card>

      <Card id="security" className="mb-6">
        <CardHeader>
          <CardTitle>g) Seguridad de datos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Implementamos medidas de seguridad diseñadas para proteger su información personal contra acceso no
            autorizado y uso indebido.
          </p>
          <p className="mt-2">
            Los datos de geolocalización se transmiten utilizando conexiones seguras (HTTPS) y se procesan con los más
            altos estándares de seguridad. Implementamos medidas técnicas y organizativas para garantizar que sus datos
            de ubicación estén protegidos en todo momento.
          </p>
        </CardContent>
      </Card>

      <Card id="children" className="mb-6">
        <CardHeader>
          <CardTitle>h) Niños</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow no solicita ni recopila intencionadamente información de identificación personal sobre menores
            de 16 años. Si descubrimos que hemos recopilado información personal de un menor de 16 años sin verificación
            del consentimiento parental, tomaremos medidas para eliminar esa información lo antes posible.
          </p>
          <p className="mt-2">
            Los visitantes de la plataforma que sean menores de 16 años deben buscar ayuda de sus padres o tutores
            legales cuando utilicen nuestros servicios y no deben proporcionar ninguna información de identificación
            personal.
          </p>
        </CardContent>
      </Card>

      <Card id="cookies" className="mb-6">
        <CardHeader>
          <CardTitle>i) Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow utiliza cookies y tecnologías similares para mejorar su experiencia en nuestra plataforma,
            recordar sus preferencias y proporcionarle contenido personalizado.
          </p>
          <p className="mt-2">
            Para más información sobre cómo utilizamos las cookies, consulte nuestra{" "}
            <a href="/politica-cookies" className="text-primary hover:underline">
              Política de Cookies
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <Card id="control" className="mb-6">
        <CardHeader>
          <CardTitle>j) Control de sus datos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Usted tiene control total sobre sus datos de ubicación:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Puede activar o desactivar los servicios de ubicación en cualquier momento</li>
            <li>Puede elegir el nivel de precisión de la ubicación que desea compartir</li>
            <li>Puede borrar su historial de ubicaciones desde su perfil</li>
            <li>Puede optar por introducir manualmente su ubicación en lugar de usar la geolocalización automática</li>
          </ul>
          <p className="mt-2">Para gestionar estos ajustes, visite la sección "Privacidad" en su perfil de usuario.</p>
        </CardContent>
      </Card>

      <Card id="rights" className="mb-6">
        <CardHeader>
          <CardTitle>k) Derechos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            De acuerdo con la legislación aplicable en materia de protección de datos, usted tiene los siguientes
            derechos:
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Derecho</th>
                  <th className="text-left py-2 px-4">¿Qué implica?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">Derecho de acceso</td>
                  <td className="py-2 px-4">Consultar qué datos personales maneja BarkAndMeow sobre usted</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Derecho de rectificación</td>
                  <td className="py-2 px-4">Solicitar la corrección de datos inexactos</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Derecho de oposición</td>
                  <td className="py-2 px-4">Oponerse al tratamiento de sus datos para determinadas finalidades</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Derecho de supresión</td>
                  <td className="py-2 px-4">Solicitar que eliminemos sus datos personales</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Derecho a la limitación</td>
                  <td className="py-2 px-4">Solicitar que BarkAndMeow limite el tratamiento de datos personales</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            Para ejercer estos derechos, puede ponerse en contacto con nosotros a través de los canales indicados en la
            sección "Identidad y datos de contacto del Responsable".
          </p>
        </CardContent>
      </Card>

      <Card id="changes" className="mb-6">
        <CardHeader>
          <CardTitle>l) Cambios en esta Política</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Podemos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos cualquier cambio
            publicando la nueva Política de Privacidad en esta página y, si los cambios son significativos, le
            enviaremos una notificación.
          </p>
          <p className="mt-2">Última actualización: 8 de marzo de 2025</p>
        </CardContent>
      </Card>
    </div>
  )
}

