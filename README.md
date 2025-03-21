# Game RPG

Un jeu de rôle en ligne avec système de progression et de combat.

## CI/CD Pipeline

Le projet utilise GitHub Actions pour l'intégration continue et le déploiement continu.

### Workflow

Le pipeline CI/CD se compose de deux jobs principaux :

1. **Build et Test** :
   - Installation des dépendances frontend et backend
   - Build du frontend
   - Exécution des tests
   - Build et test des conteneurs Docker

2. **Déploiement** :
   - Déploiement automatique sur l'environnement de production (si sur la branche main/master)

### Configuration requise

- Node.js 18+
- Docker et Docker Compose
- MongoDB

### Variables d'environnement

Pour le déploiement, vous devez configurer les secrets GitHub suivants :
- `DOCKER_USERNAME` : Votre nom d'utilisateur Docker Hub
- `DOCKER_PASSWORD` : Votre mot de passe Docker Hub
- `DEPLOY_SSH_KEY` : Clé SSH pour le déploiement
- `DEPLOY_HOST` : Adresse IP ou nom d'hôte du serveur de production

### Commandes locales

```bash
# Installation des dépendances
npm install

# Lancer les tests
npm test

# Build pour la production
npm run build

# Lancer avec Docker
docker-compose up --build
```

### Déploiement manuel

```bash
# Build des images
docker-compose build

# Push vers Docker Hub
docker-compose push

# Déployer sur le serveur
ssh user@your-server 'cd /path/to/app && docker-compose pull && docker-compose up -d'
``` 