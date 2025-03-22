#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Configuración de Cloudflare Tunnel para BarkAndMeow ===${NC}"

# Verificar si cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}Cloudflared no está instalado. Instalando...${NC}"
    
    # Detectar el sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Detectado: Linux"
        if command -v apt-get &> /dev/null; then
            # Debian/Ubuntu
            curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
            sudo dpkg -i cloudflared.deb
            rm cloudflared.deb
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
            sudo yum localinstall -y cloudflared.rpm
            rm cloudflared.rpm
        else
            echo -e "${RED}No se pudo detectar el gestor de paquetes. Por favor, instala cloudflared manualmente.${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Detectado: macOS"
        if command -v brew &> /dev/null; then
            brew install cloudflare/cloudflare/cloudflared
        else
            echo -e "${RED}Homebrew no está instalado. Por favor, instala cloudflared manualmente.${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows con Git Bash o similar
        echo "Detectado: Windows"
        echo -e "${YELLOW}En Windows, descarga el instalador desde:${NC}"
        echo -e "${YELLOW}https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi${NC}"
        echo -e "${YELLOW}Instálalo y luego continúa con este script.${NC}"
        read -p "¿Has instalado cloudflared? (s/n): " response
        if [[ "$response" != "s" && "$response" != "S" ]]; then
            echo -e "${RED}Por favor, instala cloudflared y vuelve a ejecutar este script.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Sistema operativo no reconocido. Por favor, instala cloudflared manualmente.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} cloudflared instalado correctamente"

# Iniciar sesión en Cloudflare
echo -e "${BLUE}Iniciando sesión en Cloudflare...${NC}"
echo -e "${YELLOW}NOTA: Se abrirá una ventana en tu navegador para autenticarte con Cloudflare.${NC}"
cloudflared login

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al iniciar sesión en Cloudflare. Por favor, inténtalo de nuevo.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Sesión iniciada correctamente en Cloudflare"

# Crear un nuevo túnel
echo -e "${BLUE}Creando un nuevo túnel...${NC}"
read -p "Nombre para el túnel (ej: barkandmeow): " TUNNEL_NAME

if [ -z "$TUNNEL_NAME" ]; then
    TUNNEL_NAME="barkandmeow"
    echo -e "${YELLOW}Usando nombre predeterminado: ${TUNNEL_NAME}${NC}"
fi

TUNNEL_OUTPUT=$(cloudflared tunnel create $TUNNEL_NAME)
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al crear el túnel. Mensaje de error:${NC}"
    echo "$TUNNEL_OUTPUT"
    exit 1
fi

# Extraer el ID del túnel del output
TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oE 'Created tunnel [a-z0-9-]+' | grep -oE '[a-z0-9-]+$')

if [ -z "$TUNNEL_ID" ]; then
    echo -e "${RED}No se pudo extraer el ID del túnel. Salida:${NC}"
    echo "$TUNNEL_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✓${NC} Túnel creado con ID: $TUNNEL_ID"

# Obtener el token del túnel
TUNNEL_TOKEN=$(cloudflared tunnel token $TUNNEL_ID)
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al obtener el token del túnel.${NC}"
    exit 1
fi

# Guardar el token en el archivo .env
echo -e "${BLUE}Guardando el token en el archivo .env...${NC}"
if [ -f .env ]; then
    if grep -q "CLOUDFLARE_TUNNEL_TOKEN=" .env; then
        sed -i.bak "s/CLOUDFLARE_TUNNEL_TOKEN=.*/CLOUDFLARE_TUNNEL_TOKEN=$TUNNEL_TOKEN/" .env
    else
        echo "CLOUDFLARE_TUNNEL_TOKEN=$TUNNEL_TOKEN" >> .env
    fi
else
    echo "CLOUDFLARE_TUNNEL_TOKEN=$TUNNEL_TOKEN" > .env
    echo -e "${YELLOW}Se ha creado un nuevo archivo .env con el token del túnel.${NC}"
    echo -e "${YELLOW}Es recomendable agregar tus otras variables de entorno a este archivo.${NC}"
fi

echo -e "${GREEN}✓${NC} Token guardado en el archivo .env"

# Configurar el DNS para el túnel
echo -e "${BLUE}Configurando DNS para el túnel...${NC}"
read -p "Dominio de Cloudflare (ej: tudominio.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}El dominio es obligatorio.${NC}"
    exit 1
fi

read -p "Subdominio para la aplicación (ej: barkandmeow): " SUBDOMAIN

if [ -z "$SUBDOMAIN" ]; then
    SUBDOMAIN="barkandmeow"
    echo -e "${YELLOW}Usando subdominio predeterminado: ${SUBDOMAIN}${NC}"
fi

DNS_RESULT=$(cloudflared tunnel route dns $TUNNEL_ID $SUBDOMAIN.$DOMAIN)
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al configurar el DNS. Mensaje de error:${NC}"
    echo "$DNS_RESULT"
    exit 1
fi

echo -e "${GREEN}✓${NC} DNS configurado correctamente"

# Crear docker-compose.cloudflare.yml
echo -e "${BLUE}Creando archivo docker-compose.cloudflare.yml...${NC}"
cat > docker-compose.cloudflare.yml << EOF
version: '3'

services:
  app:
    image: topgambajrjdeveloper/barkandmeow
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://${SUBDOMAIN}.${DOMAIN}
      - NEXTAUTH_URL=https://${SUBDOMAIN}.${DOMAIN}
      - AUTH_URL=https://${SUBDOMAIN}.${DOMAIN}
      - SITE_URL=https://${SUBDOMAIN}.${DOMAIN}

  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=\${CLOUDFLARE_TUNNEL_TOKEN}
    depends_on:
      - app
EOF

echo -e "${GREEN}✓${NC} Archivo docker-compose.cloudflare.yml creado"

# Preguntar si quiere iniciar ahora
echo -e "${BLUE}Configuración completada.${NC}"
echo -e "${GREEN}Tu aplicación estará disponible en:${NC} https://$SUBDOMAIN.$DOMAIN"
read -p "¿Quieres iniciar la aplicación ahora? (s/n): " START_NOW

if [[ "$START_NOW" == "s" || "$START_NOW" == "S" ]]; then
    echo -e "${BLUE}Iniciando la aplicación...${NC}"
    docker-compose -f docker-compose.cloudflare.yml up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} ¡Aplicación iniciada correctamente!"
        echo -e "${BLUE}Puedes acceder a tu aplicación en:${NC} https://$SUBDOMAIN.$DOMAIN"
        echo -e "${YELLOW}NOTA: Puede tomar unos minutos para que los cambios de DNS se propaguen.${NC}"
    else
        echo -e "${RED}Error al iniciar la aplicación.${NC}"
    fi
else
    echo -e "${BLUE}Para iniciar la aplicación más tarde, ejecuta:${NC}"
    echo -e "${GREEN}docker-compose -f docker-compose.cloudflare.yml up -d${NC}"
fi

echo -e "${BLUE}=== Configuración de Cloudflare Tunnel completada ===${NC}"

