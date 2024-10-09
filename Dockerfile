FROM node:20.15.0

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json ./

# Nettoyer le cache npm et installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application pour la production
RUN npm run build

# Étape de production
FROM nginx:alpine

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés dans le répertoire Nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Commande pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]