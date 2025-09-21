# Dockerfile para Chatbot-Teacher

FROM node:20-alpine AS builder

# Configurações de build (ajustadas via build args no compose)
ARG VITE_APP_BASE_PATH="/"
ARG VITE_POCKETBASE_URL="http://127.0.0.1:8090"
ENV VITE_APP_BASE_PATH=${VITE_APP_BASE_PATH}
ENV VITE_POCKETBASE_URL=${VITE_POCKETBASE_URL}

WORKDIR /app

# Dependências úteis em build
RUN apk add --no-cache curl

# Copiar package.json e package-lock.json
COPY package*.json ./
COPY bun.lockb* ./

# Instalar bun e dependências
RUN npm install -g bun
RUN if [ -f "bun.lockb" ]; then bun install; else npm ci; fi

# Copiar código fonte
COPY . .

# Definir variáveis de ambiente para build (podem ser sobrescritas via args)
ARG VITE_POCKETBASE_URL=http://localhost:8090
ARG VITE_API_URL=http://localhost:8000
ARG NODE_ENV=production

ENV VITE_POCKETBASE_URL=${VITE_POCKETBASE_URL}
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=${NODE_ENV}

# Build da aplicação
RUN if [ -f "bun.lockb" ]; then bun run build; else npm run build; fi

# Garante que o build foi gerado
RUN test -d dist

# Estágio de produção
FROM nginx:alpine

# Ferramentas necessárias em runtime (healthcheck)
RUN apk add --no-cache curl

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 3000
EXPOSE 3000

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
