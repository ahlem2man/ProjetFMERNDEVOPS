# Étape 1 : Construction (Build)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./

# AJOUT DE --legacy-peer-deps ICI POUR RÉSOLRE LE CONFLIT REACT 19
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Étape 2 : Serveur de production (Nginx)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]