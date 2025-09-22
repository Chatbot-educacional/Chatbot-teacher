# Dockerfile para Chatbot-Teacher
FROM node:18-alpine AS builder

# Configurações de build (ajustadas via build args no compose)
ARG VITE_APP_BASE_PATH="/"
ARG VITE_POCKETBASE_URL="http://127.0.0.1:8090"
ARG VITE_PUBLIC_POSTHOG_KEY=""
ARG VITE_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
ENV VITE_APP_BASE_PATH=${VITE_APP_BASE_PATH}
ENV VITE_POCKETBASE_URL=${VITE_POCKETBASE_URL}
ENV VITE_PUBLIC_POSTHOG_KEY=${VITE_PUBLIC_POSTHOG_KEY}
ENV VITE_PUBLIC_POSTHOG_HOST=${VITE_PUBLIC_POSTHOG_HOST}

WORKDIR /app

# Dependências úteis em build
RUN apk add --no-cache curl

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

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
