export interface LocationData {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  source?: "gps" | "ip" | "browser" | "none";
}

// Detectar si es un dispositivo móvil
function isMobileDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Verificar el estado del permiso de geolocalización
async function checkPermissionStatus(): Promise<string> {
  if (typeof navigator === "undefined" || !("permissions" in navigator))
    return "unknown";

  try {
    const result = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    return result.state; // 'granted', 'denied', o 'prompt'
  } catch (error) {
    console.error(
      "Error checking permission status:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return "unknown";
  }
}

export async function getUserLocation(
  highAccuracyForced?: boolean
): Promise<LocationData> {
  // Determinar si debemos usar alta precisión basado en el tipo de dispositivo
  // o si se ha forzado explícitamente
  const isMobile = isMobileDevice();
  const useHighAccuracy =
    highAccuracyForced !== undefined ? highAccuracyForced : isMobile;

  if (typeof window !== "undefined" && "geolocation" in navigator) {
    // Verificar el estado del permiso
    const permissionStatus = await checkPermissionStatus();

    if (permissionStatus === "denied") {
      console.log(
        "Permiso de geolocalización denegado permanentemente, usando IP"
      );
      return getLocationByIP();
    }

    try {
      // Opciones específicas para mejorar la precisión en dispositivos móviles
      const options: PositionOptions = {
        enableHighAccuracy: useHighAccuracy, // Activa el GPS de alta precisión cuando está disponible
        timeout: 10000, // 10 segundos de timeout
        maximumAge: 0, // Siempre obtener posición actual, no usar caché
      };

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        }
      );

      const { latitude, longitude, accuracy } = position.coords;
      console.log(`Ubicación obtenida con precisión de ${accuracy} metros`);

      const locationData = await reverseGeocode(latitude, longitude);
      return {
        ...locationData,
        latitude,
        longitude,
        accuracy,
        source: "gps",
      };
    } catch (error) {
      // Manejo mejorado para errores de geolocalización
      let errorMessage = "Error desconocido de geolocalización";
      let isCriticalError = false;

      // Verificar si es un error de geolocalización específico
      if (error && typeof error === "object" && "code" in error) {
        // Es un GeolocationPositionError
        const geoError = error as GeolocationPositionError;

        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Usuario denegó el permiso de geolocalización";
            // No es un error crítico, el usuario eligió no compartir su ubicación
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Información de ubicación no disponible";
            // No es un error crítico, simplemente no se pudo obtener la ubicación
            break;
          case 3: // TIMEOUT
            errorMessage = "Tiempo de espera agotado para obtener la ubicación";
            // No es un error crítico, simplemente tomó demasiado tiempo
            break;
          default:
            // Cualquier otro código de error desconocido se considera crítico
            isCriticalError = true;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        isCriticalError = true;
      }

      // Usar el nivel de log apropiado según la criticidad del error
      if (isCriticalError) {
        console.error("Error crítico de geolocalización:", errorMessage);
      } else {
        console.log(
          "No se pudo obtener la ubicación precisa:",
          errorMessage,
          "- Usando ubicación por IP como alternativa"
        );
      }

      // Si falla GPS, intentar con IP
      return getLocationByIP();
    }
  } else {
    // Si geolocalización no está disponible, usar IP
    console.log("Geolocalización no disponible en este navegador, usando IP");
    return getLocationByIP();
  }
}

async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<LocationData> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`,
      {
        headers: {
          "User-Agent": "PetSocialNetwork/1.0", // Es buena práctica identificar tu aplicación
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return {
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality,
      country: data.address?.country,
    };
  } catch (error) {
    console.error(
      "Error reverse geocoding:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {};
  }
}

async function getLocationByIP(): Promise<LocationData> {
  try {
    // Intentar primero con ipapi.co
    const response = await fetch("https://ipapi.co/json/");

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return {
      city: data.city,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: 10000, // Precisión aproximada en metros para IP (10km)
      source: "ip",
    };
  } catch (error) {
    console.error(
      "Error getting location by IP with ipapi:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Fallback a ipinfo.io si ipapi falla
    try {
      const fallbackResponse = await fetch("https://ipinfo.io/json");
      const fallbackData = await fallbackResponse.json();

      // ipinfo devuelve coordenadas como "lat,lon"
      const [latitude, longitude] = (fallbackData.loc || "0,0")
        .split(",")
        .map(Number);

      return {
        city: fallbackData.city,
        country: fallbackData.country,
        latitude,
        longitude,
        accuracy: 15000, // Precisión aproximada en metros para IP (15km)
        source: "ip",
      };
    } catch (fallbackError) {
      console.error(
        "Fallback location service also failed:",
        fallbackError instanceof Error ? fallbackError.message : "Unknown error"
      );

      // Devolver objeto vacío si todos los métodos fallan
      return {
        source: "none",
      };
    }
  }
}

// Función auxiliar para solicitar ubicación con contexto para el usuario
export function requestLocationWithContext(
  message: string = "Para mostrarte contenido cercano, necesitamos acceder a tu ubicación."
): Promise<LocationData> {
  if (typeof window === "undefined") {
    return Promise.resolve({});
  }

  // Mostrar mensaje explicativo antes de solicitar permiso
  const userConfirmed = window.confirm(message);

  if (userConfirmed) {
    return getUserLocation(true); // Solicitar con alta precisión
  } else {
    console.log("Usuario rechazó solicitud de ubicación, usando IP");
    return getLocationByIP();
  }
}
