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

# Get auth
COPY auth/package*.json ./auth/
COPY auth/tsconfig*.json ./auth/
RUN npm install -w @ticketing/auth
COPY auth auth
RUN npm run build -w @ticketing/auth

CMD ["node", "/app/auth"]
# WORKDIR /app/auth

# CMD ["npm", "start"]