# Utiliser une version stable et légère de Node.js
FROM node:18-alpine

# Définir le dossier de travail à l'intérieur du conteneur
WORKDIR /app

# Copier les fichiers de gestion des dépendances
COPY package*.json ./

# Installer les dépendances (npm install)
RUN npm install

# Copier tout le reste de votre code source backend
COPY . .

# Exposer le port 5000 (le port que vous avez identifié tout à l'heure) 
EXPOSE 5000

# Commande pour démarrer le serveur sans nodemon (mieux pour la production)
CMD ["node", "server.js"]