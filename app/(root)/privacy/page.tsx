/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recopilación de Información</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow recopila información personal que usted nos proporciona directamente, como su nombre, dirección de
            correo electrónico y detalles sobre sus mascotas. También podemos recopilar información sobre su uso de
            nuestros servicios.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Datos de Ubicación y Geolocalización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              BarkAndMeow puede solicitar acceso a su ubicación geográfica para mejorar su experiencia en nuestra plataforma,
              mostrándole mascotas y usuarios cercanos a su ubicación.
            </p>
            
            <h3 className="font-semibold text-lg mt-4">Consideraciones importantes sobre la geolocalización:</h3>
            
            <div className="pl-4 border-l-2 border-primary/20 mt-2">
              <h4 className="font-medium">1. Privacidad y transparencia</h4>
              <p className="text-sm mt-1 mb-3">
                Siempre le informaremos cuando recopilemos datos de ubicación y para qué los utilizaremos. 
                Nunca recopilaremos su ubicación sin su conocimiento o consentimiento explícito. 
                Puede revocar este permiso en cualquier momento a través de la configuración de su navegador o dispositivo.
              </p>
              
              <h4 className="font-medium">2. Precisión vs. Intrusión</h4>
              <p className="text-sm mt-1 mb-3">
                Los métodos de geolocalización más precisos (como el GPS) requieren más permisos y pueden ser más intrusivos.
                Le ofrecemos diferentes opciones de precisión:
              </p>
              <ul className="list-disc pl-6 text-sm mb-3">
                <li>Alta precisión (GPS): Para encontrar mascotas muy cercanas a su ubicación exacta</li>
                <li>Precisión media (WiFi/red): Balance entre precisión y privacidad</li>
                <li>Baja precisión (basada en IP): Menor precisión pero mayor privacidad</li>
              </ul>
              <p className="text-sm mb-3">
                Usted decide qué nivel de precisión desea compartir según sus necesidades.
              </p>
              
              <h4 className="font-medium">3. Límites de uso</h4>
              <p className="text-sm mt-1 mb-3">
                Utilizamos servicios gratuitos de geolocalización que tienen límites en el número de solicitudes.
                En caso de alcanzar estos límites, es posible que algunas funciones de localización no estén disponibles
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
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Uso de la Información</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, así como para
            comunicarnos con usted sobre actualizaciones, ofertas y eventos relacionados con BarkAndMeow.
          </p>
          <p className="mt-2">
            Los datos de ubicación se utilizan específicamente para:
          </p>
          <ul className="list-disc pl-6 mt-1">
            <li>Mostrar mascotas y usuarios cercanos a su ubicación</li>
            <li>Recomendar eventos para mascotas en su área</li>
            <li>Proporcionar información sobre servicios veterinarios y tiendas cercanas</li>
            <li>Facilitar encuentros entre mascotas en parques o áreas comunes</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Compartir Información</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            No vendemos ni compartimos su información personal con terceros, excepto en los casos descritos en esta
            política o con su consentimiento explícito.
          </p>
          <p className="mt-2">
            Sus datos de ubicación precisa nunca se comparten con otros usuarios sin su autorización. 
            Otros usuarios solo pueden ver su ubicación aproximada (como su ciudad o barrio) si usted lo permite
            en su configuración de privacidad.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Implementamos medidas de seguridad diseñadas para proteger su información personal contra acceso no
            autorizado y uso indebido.
          </p>
          <p className="mt-2">
            Los datos de geolocalización se transmiten utilizando conexiones seguras (HTTPS) y se procesan
            con los más altos estándares de seguridad. Implementamos medidas técnicas y organizativas
            para garantizar que sus datos de ubicación estén protegidos en todo momento.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Control de sus datos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Usted tiene control total sobre sus datos de ubicación:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Puede activar o desactivar los servicios de ubicación en cualquier momento</li>
            <li>Puede elegir el nivel de precisión de la ubicación que desea compartir</li>
            <li>Puede borrar su historial de ubicaciones desde su perfil</li>
            <li>Puede optar por introducir manualmente su ubicación en lugar de usar la geolocalización automática</li>
          </ul>
          <p className="mt-2">            
            Para gestionar estos ajustes, visite la sección "Privacidad" en su perfil de usuario.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cambios en esta Política</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Podemos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos cualquier cambio
            publicando la nueva Política de Privacidad en esta página y, si los cambios son significativos,
            le enviaremos una notificación.
          </p>
          <p className="mt-2">
            Última actualización: 8 de marzo de 2025
          </p>
        </CardContent>
      </Card>
    </div>
  )
}