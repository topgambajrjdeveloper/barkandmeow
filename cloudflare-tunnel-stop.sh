#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Deteniendo Cloudflare Tunnel para BarkAndMeow ===${NC}"

# Detener los contenedores
echo -e "${BLUE}Deteniendo los contenedores...${NC}"
docker-compose -f docker-compose.cloudflare.yml down

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Contenedores detenidos correctamente"
else
    echo -e "${RED}Error al detener los contenedores.${NC}"
    exit 1
fi

echo -e "${YELLOW}NOTA: El túnel de Cloudflare sigue configurado y puedes volver a iniciarlo con:${NC}"
echo -e "${GREEN}docker-compose -f docker-compose.cloudflare.yml up -d${NC}"

read -p "¿Quieres eliminar completamente el túnel de Cloudflare? (s/n): " DELETE_TUNNEL

if [[ "$DELETE_TUNNEL" == "s" || "$DELETE_TUNNEL" == "S" ]]; then
    # Obtener el ID del túnel
    echo -e "${BLUE}Obteniendo lista de túneles...${NC}"
    TUNNELS=$(cloudflared tunnel list)
    
    echo "$TUNNELS"
    echo ""
    
    read -p "Introduce el ID del túnel que quieres eliminar: " TUNNEL_ID
    
    if [ -z "$TUNNEL_ID" ]; then
        echo -e "${RED}ID de túnel no válido.${NC}"
        exit 1
    fi
    
    # Eliminar el túnel
    echo -e "${BLUE}Eliminando el túnel...${NC}"
    DELETE_RESULT=$(cloudflared tunnel delete -f $TUNNEL_ID)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Túnel eliminado correctamente"
        
        # Actualizar el archivo .env
        if [ -f .env ] && grep -q "CLOUDFLARE_TUNNEL_TOKEN=" .env; then
            sed -i.bak "s/CLOUDFLARE_TUNNEL_TOKEN=.*/#CLOUDFLARE_TUNNEL_TOKEN=ELIMINADO/" .env
            echo -e "${GREEN}✓${NC} Token del túnel eliminado del archivo .env"
        fi
    else
        echo -e "${RED}Error al eliminar el túnel. Mensaje de error:${NC}"
        echo "$DELETE_RESULT"
    fi
fi

echo -e "${BLUE}=== Operación completada ===${NC}"

