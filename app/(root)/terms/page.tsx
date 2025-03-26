import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Términos y Condiciones | BarkAndMeow",
  description: "Términos y condiciones de uso de la plataforma BarkAndMeow",
}

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>

      <p className="mb-6">
        BarkAndMeow presta servicios en Internet con la marca BarkAndMeow, en los términos recogidos en las presentes
        condiciones generales:
      </p>

      {/* Índice de contenidos */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <ul className="space-y-1">
            <li>
              <a href="#info-general" className="text-primary hover:underline">
                1. Información General
              </a>
            </li>
            <li>
              <a href="#aceptacion" className="text-primary hover:underline">
                2. Aceptación de las Condiciones
              </a>
            </li>
            <li>
              <a href="#obligaciones" className="text-primary hover:underline">
                3. Obligaciones del Usuario
              </a>
            </li>
            <li>
              <a href="#responsabilidad" className="text-primary hover:underline">
                4. Responsabilidad sobre Contenidos
              </a>
            </li>
            <li>
              <a href="#restricciones" className="text-primary hover:underline">
                5. Restricciones de Uso
              </a>
            </li>
            <li>
              <a href="#limitacion" className="text-primary hover:underline">
                6. Limitación de Responsabilidad
              </a>
            </li>
            <li>
              <a href="#interrupcion" className="text-primary hover:underline">
                7. Interrupción del Servicio
              </a>
            </li>
            <li>
              <a href="#modificaciones-servicio" className="text-primary hover:underline">
                8. Modificaciones del Servicio
              </a>
            </li>
            <li>
              <a href="#modificaciones-condiciones" className="text-primary hover:underline">
                9. Modificaciones de las Condiciones
              </a>
            </li>
            <li>
              <a href="#proteccion-datos" className="text-primary hover:underline">
                10. Protección de Datos
              </a>
            </li>
            <li>
              <a href="#propiedad-intelectual" className="text-primary hover:underline">
                11. Derechos de Propiedad Intelectual
              </a>
            </li>
            <li>
              <a href="#legislacion" className="text-primary hover:underline">
                12. Legislación Aplicable y Jurisdicción
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card id="info-general" className="mb-6">
        <CardHeader>
          <CardTitle>1. Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            En cumplimiento con el deber de información recogida en el artículo 10 de la Ley 34/2002, de 11 de julio, de
            Servicios de la Sociedad de la Información y de Comercio Electrónico, a continuación se reflejan los
            siguientes datos:
          </p>
          <p className="mt-2">
            BarkAndMeow es propiedad y está gestionado por la empresa BarkAndMeow, con domicilio en [DIRECCIÓN], España,
            con número de C.I.F. [NÚMERO].
          </p>
          <p className="mt-2">
            Los servicios que componen la red de servicios BarkAndMeow para los usuarios son los que en cada momento
            sean ofertados dentro de la plataforma BarkAndMeow, siendo todos ellos en principio, y sin perjuicio de que
            esta circunstancia pueda variar de acuerdo con la cláusula novena de estas condiciones, de carácter
            gratuito. Algunos de los servicios ofertados requieren el registro previo del usuario, para cuya utilización
            deberá darse de alta como usuario de BarkAndMeow.
          </p>
        </CardContent>
      </Card>

      <Card id="aceptacion" className="mb-6">
        <CardHeader>
          <CardTitle>2. Aceptación de las Condiciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Por el mero uso de la plataforma BarkAndMeow, el usuario manifiesta su aceptación sin reservas de las
            presentes condiciones generales.
          </p>
        </CardContent>
      </Card>

      <Card id="obligaciones" className="mb-6">
        <CardHeader>
          <CardTitle>3. Obligaciones del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            El usuario se obliga a no utilizar los servicios para la realización de actividades contrarias a las leyes,
            a la moral, al orden público y, en general, se obliga a hacer un uso conforme a las presentes condiciones
            generales. Se obliga asimismo a no realizar a través de los servicios, actividades publicitarias o de
            explotación comercial y a no remitir mensajes utilizando una identidad falsa, así como a no camuflar de
            manera alguna el origen del mensaje.
          </p>
        </CardContent>
      </Card>

      <Card id="responsabilidad" className="mb-6">
        <CardHeader>
          <CardTitle>4. Responsabilidad sobre Contenidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow actúa exclusivamente como prestador de un servicio de comunicación entre las partes, no
            haciéndose responsable de los contenidos que, en contravención a las presentes condiciones generales, las
            partes puedan enviarse, siendo el usuario el único responsable de la veracidad y licitud de los mismos. De
            manera especial, se prohíbe la utilización de los servicios para la remisión de publicidad o de material
            crítico con los proveedores del servicio.
          </p>
        </CardContent>
      </Card>

      <Card id="restricciones" className="mb-6">
        <CardHeader>
          <CardTitle>5. Restricciones de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <p>El usuario se obliga a respetar las restricciones de uso del servicio impuestas por BarkAndMeow.</p>
        </CardContent>
      </Card>

      <Card id="limitacion" className="mb-6">
        <CardHeader>
          <CardTitle>6. Limitación de Responsabilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow no será responsable de los fallos que pudieran producirse en las comunicaciones, incluido el
            borrado, transmisión incompleta o retrasos en la remisión, no comprometiéndose tampoco a que la red de
            transmisión esté operativa en todo momento. Tampoco responderá BarkAndMeow en caso de que un tercero,
            quebrando las medidas de seguridad establecidas por BarkAndMeow, acceda a los mensajes o los utilice para la
            remisión de virus informáticos.
          </p>
          <p className="mt-2">
            BarkAndMeow tratará tus datos personales de manera absolutamente confidencial. Para ello, ha implantado
            medidas técnicas y organizativas adecuadas para garantizar la seguridad de sus datos personales y evitar su
            destrucción, pérdida, acceso ilícito o alteraciones ilícitas. A la hora de determinar estas medidas, se han
            tenido en cuenta criterios como el alcance, el contexto, los finos del tratamiento, el estado de la técnica
            y los riesgos existentes.
          </p>
          <p className="mt-2">
            BarkAndMeow ha adoptado todas las medidas de seguridad legalmente exigidas para la protección de los datos
            personales suministrados por el usuario. No obstante, BarkAndMeow no puede garantizar la invulnerabilidad
            absoluta de sus sistemas de seguridad, ni puede garantizar la seguridad o inviolabilidad de dichos datos en
            su transmisión a través de la red.
          </p>
          <p className="mt-2">
            BarkAndMeow no garantiza la licitud, confiabilidad y utilidad de los contenidos, así como tampoco su
            veracidad o exactitud.
          </p>
          <p className="mt-2">
            Los dispositivos de enlace que la plataforma pone a disposición de los usuarios tienen por único objeto
            facilitar a los mismos la búsqueda de la información disponible en Internet. BarkAndMeow no ofrece ni
            comercializa los productos y servicios disponibles en los sitios enlazados ni asume responsabilidad alguna
            por tales productos o servicios.
          </p>
          <p className="mt-2">
            BarkAndMeow no controla la utilización que los usuarios hacen de la plataforma, ni garantiza que lo hagan de
            forma conforme a las presentes condiciones generales.
          </p>
        </CardContent>
      </Card>

      <Card id="interrupcion" className="mb-6">
        <CardHeader>
          <CardTitle>7. Interrupción del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow podrá interrumpir el servicio o resolver de modo inmediato la relación con el usuario si detecta
            un uso de su plataforma o de cualquiera de los servicios ofertados en el mismo contrario a las presentes
            condiciones generales.
          </p>
        </CardContent>
      </Card>

      <Card id="modificaciones-servicio" className="mb-6">
        <CardHeader>
          <CardTitle>8. Modificaciones del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow se reserva el derecho de dejar de prestar cualquiera de los servicios que integran la
            plataforma, bastando para ello comunicarlo en la pantalla de acceso al servicio con un preaviso de quince
            días. Se reserva, asimismo, el derecho de modificar unilateralmente, en cualquier momento y sin previo
            aviso, la presentación y condiciones de la plataforma, así como los servicios y las condiciones requeridas
            para su utilización.
          </p>
        </CardContent>
      </Card>

      <Card id="modificaciones-condiciones" className="mb-6">
        <CardHeader>
          <CardTitle>9. Modificaciones de las Condiciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow podrá, en cualquier momento, modificar las presentes condiciones generales o introducir nuevas
            condiciones de uso, incluido el cese de la gratuidad. Dichas modificaciones sólo serán de aplicación a
            partir de su entrada en vigor.
          </p>
        </CardContent>
      </Card>

      <Card id="proteccion-datos" className="mb-6">
        <CardHeader>
          <CardTitle>10. Protección de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            El usuario acepta que los datos personales por él facilitados o que se facilitan en el futuro a BarkAndMeow
            puedan ser objeto de un tratamiento que será incorporado en un registro de actividades del tratamiento del
            que BarkAndMeow es Titular y Responsable.
          </p>
          <p className="mt-2">
            La información acerca del tratamiento que se realiza de los datos, las finalidades y bases de legitimación,
            así como los destinatarios de los datos y sus derechos como interesados se recoge en la{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Política de Privacidad
            </a>
            .
          </p>
          <p className="mt-2">
            El titular de los datos podrá aceptar la instalación de Cookies en su navegador. Para más información, puede
            consultar la{" "}
            <a href="/politica-cookies" className="text-primary hover:underline">
              Política de Cookies
            </a>{" "}
            de BarkAndMeow.
          </p>
        </CardContent>
      </Card>

      <Card id="propiedad-intelectual" className="mb-6">
        <CardHeader>
          <CardTitle>11. Derechos de Propiedad Intelectual</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Se otorga permiso para copiar, distribuir y/o modificar los contenidos publicados en www.barkandmeow.com
            —salvo aquellos que se indican de forma explícita— bajo los términos de la Licencia Creative Commons.
          </p>
        </CardContent>
      </Card>

      <Card id="legislacion" className="mb-6">
        <CardHeader>
          <CardTitle>12. Legislación Aplicable y Jurisdicción</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Las partes, con expresa renuncia a su propio fuero, aceptan como legislación rectora de las presentes
            condiciones generales, la española y se someten para la resolución de cuantos litigios puedan derivarse del
            mismo a los Juzgados y Tribunales de Madrid.
          </p>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mt-8">
        Última actualización:{" "}
        {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  )
}

