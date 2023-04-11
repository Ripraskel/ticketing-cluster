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

# Get tickets
COPY tickets/package*.json ./tickets/
COPY tickets/tsconfig*.json ./tickets/
RUN npm install -w @ticketing/tickets
COPY tickets tickets
RUN npm run build -w @ticketing/tickets

CMD ["node", "/app/tickets"]