# Use a imagem oficial do Node.js 20 para buildar o frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Instale dependências
COPY package*.json ./
RUN npm install

# Copie o código e builde o React para a pasta dist/
COPY . .
RUN npm run build

# --- ESTÁGIO DE EXECUÇÃO ---
FROM node:20-alpine

WORKDIR /app

# Copie apenas o que for estritamente necessário para rodar o app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Copie o resto dos arquivos incluindo o backend e a pasta dist/ do frontend
COPY --from=builder /app .

# Exponha a porta do Backend
EXPOSE 3005

# Inicie o Express que vai ler e entregar o App React também
CMD ["node", "server.js"]
