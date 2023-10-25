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

# Get payments
COPY payments/package*.json ./payments/
COPY payments/tsconfig*.json ./payments/
RUN npm install -w @ticketing/payments
COPY payments payments
RUN npm run build -w @ticketing/payments

CMD ["node", "/app/payments"]