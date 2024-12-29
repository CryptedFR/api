# Crypted API

Bienvenue dans l'API AdonisJS de l'application Crypted. Cette API fournit les fonctionnalités backend nécessaires pour l'application Crypted, notamment l'authentification, la gestion des données utilisateur, et bien plus encore.

## Prérequis

Avant de commencer, assurez-vous que votre environnement dispose des outils suivants :

- **Node.js** : version `v22.12.0`.
- **PNPM** : version `9.15.0`
- **Podman** et **Podman Compose** : pour gérer les conteneurs nécessaires au fonctionnement de l'API.

## Installation

### 1. Cloner le dépôt
```bash
git clone https://github.com/CryptedFR/api.git
cd api
```

### 2. Installer les dépendances
Utilisez `pnpm` pour installer les dépendances :

```bash
pnpm install
```

### 3. Configurer l'environnement
Créez un fichier `.env` à partir du fichier `.env.example` et configurez les variables nécessaires :

```bash
cp .env.example .env
```

### 4. Préparer les services
L'API utilise une base de données PostgreSQL et un service MinIO pour le stockage. Ces services sont gérés avec Podman Compose.

Démarrez les conteneurs et executer les migrations :
```bash
node ace services prepare
```

### 5. Reset les services
Stopper et démonter les conteneurs
```bash
node ace services reset
```

## Développement

### Lancer le serveur
Pour démarrer le serveur de développement :

```bash
pnpm dev
```

L'API sera disponible par défaut à l'adresse : `http://localhost:3333`.


**Auteur** : [Clément Mistral](https://github.com/clement-mistral)  
**Contact** : clementmistral@pm.me
