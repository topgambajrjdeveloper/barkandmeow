#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Estado de Cloudflare Tunnel para BarkAndMeow ===${NC}"

# Verificar si cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}Cloudflared no está instalado. Por favor, ejecuta primero setup-cloudflare-tunnel.sh${NC}"
    exit 1
fi

# Verificar si hay túneles activos
echo -e "${BLUE}Túneles de Cloudflare disponibles:${NC}"
TUNNELS=$(cloudflared tunnel list)

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al obtener la lista de túneles. Asegúrate de estar autenticado.${NC}"
    exit 1
fi

echo "$TUNNELS"

# Verificar si los contenedores están en ejecución
echo -e "\n${BLUE}Estado de los contenedores Docker:${NC}"
CONTAINERS=$(docker ps --filter "name=cloudflared\|barkandmeow" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")

if [ -z "$CONTAINERS" ]; then
    echo -e "${YELLOW}No se encontraron contenedores en ejecución para la aplicación.${NC}"
    echo -e "${YELLOW}Para iniciar la aplicación, ejecuta:${NC}"
    echo -e "${GREEN}docker-compose -f docker-compose.cloudflare.yml up -d${NC}"
else
    echo "$CONTAINERS"
fi

# Obtener los logs del contenedor cloudflared
echo -e "\n${BLUE}Últimas líneas del log de cloudflared:${NC}"
CLOUDFLARED_CONTAINER=$(docker ps -q --filter "name=cloudflared")

if [ -z "$CLOUDFLARED_CONTAINER" ]; then
    echo -e "${YELLOW}No se encontró ningún contenedor cloudflared en ejecución.${NC}"
else
    docker logs --tail 10 $CLOUDFLARED_CONTAINER
    
    echo -e "\n${BLUE}Para ver más logs:${NC}"
    echo -e "${GREEN}docker logs -f $CLOUDFLARED_CONTAINER${NC}"
fi

echo -e "\n${BLUE}=== Comprobación completada ===${NC}"

