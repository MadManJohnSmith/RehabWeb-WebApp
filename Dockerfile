# RehabWeb-WebApp — Angular 20 dev server
# Imagen para desarrollo: corre `ng serve` con live-reload.
FROM node:20-bookworm-slim

ENV NODE_ENV=development \
    NG_CLI_ANALYTICS=false

WORKDIR /app

# Instalar dependencias primero para aprovechar la cache de Docker.
COPY package.json package-lock.json ./
RUN npm ci

# El resto del código se monta como volumen en dev (ver docker-compose.yml).
COPY . .

EXPOSE 4200

# `--host 0.0.0.0` para exponer fuera del contenedor.
# `--poll 2000` para detección de cambios fiable en Windows + Docker.
# Los hosts permitidos se configuran en `angular.json` → security.allowedHosts.
CMD ["npx", "ng", "serve", "--host=0.0.0.0", "--port=4200", "--poll=2000"]
