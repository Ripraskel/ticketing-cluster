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

# Get orders
COPY orders/package*.json ./orders/
COPY orders/tsconfig*.json ./orders/
RUN npm install -w @ticketing/orders
COPY orders orders
RUN npm run build -w @ticketing/orders

CMD ["node", "/app/orders"]