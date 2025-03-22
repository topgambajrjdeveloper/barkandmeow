#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Construyendo Docker para Next.js (versión simple) ===${NC}"

# Construir la imagen Docker
echo -e "${BLUE}Construyendo imagen Docker...${NC}"
docker build -t topgambajrjdeveloper/barkandmeow -f Dockerfile.simple .

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Imagen Docker construida correctamente${NC}"
  echo -e "${BLUE}Para ejecutar la aplicación:${NC}"
  echo -e "docker run -p 3000:3000 --env-file .env topgambajrjdeveloper/barkandmeow"
  echo -e "${BLUE}O con Docker Compose:${NC}"
  echo -e "docker-compose -f docker-compose.simple.yml up -d"
else
  echo -e "${RED}✗ Error al construir la imagen Docker${NC}"
fi

