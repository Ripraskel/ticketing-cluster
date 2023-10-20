FROM node:alpine

WORKDIR /app

# Get workspace config
COPY package*.json ./
COPY tsconfig*.json ./

# Get common lib dependency
COPY common/package*.json ./common/
COPY common/tsconfig*.json ./common/
RUN npm install -w @ticketing/common
COPY common common
RUN npm run build -w @ticketing/common

# Get expiration
COPY expiration/package*.json ./expiration/
COPY expiration/tsconfig*.json ./expiration/
RUN npm install -w @ticketing/expiration
COPY expiration expiration
RUN npm run build -w @ticketing/expiration

CMD ["node", "/app/expiration"]