# La Ligue Informatique — Gestion sportive

Application web de gestion sportive developpee dans le cadre du **BTS SIO SLAM** (epreuve E6). Elle permet de gerer des sports, des equipes, des evenements, des matchs (avec heritage XT) et les reponses de presence des membres.

## Architecture

Le projet est separe en deux parties independantes :

- **Backend** : API REST NestJS + Prisma + SQLite
- **Frontend** : SPA React (Vite) + Tailwind CSS

```
laLigueInformatique/
├── backend/           ← API NestJS (port 3000)
│   ├── src/           ← Modules NestJS
│   ├── prisma/        ← Schema + migrations + seed
│   ├── database.sqlite ← auto-cree
│   └── package.json
├── frontend/          ← SPA React (port 5173)
│   ├── src/           ← Pages + composants
│   └── package.json
└── README.md
```

## Fonctionnalites

- **Inscription / Connexion** securisee (bcrypt + JWT)
- **Gestion des sports** : CRUD complet, inscription/desinscription des utilisateurs
- **Gestion des equipes** : creation avec nombre de places, ajout/retrait de membres (controle de capacite)
- **Gestion des evenements** : creation liee a un sport, systeme de reponses (present/absent/peut-etre)
- **Gestion des matchs** : heritage XT d'evenement, 2 equipes participantes (cardinalite 2,2), designation du gagnant
- **Tableau de bord** : statistiques personnelles (equipes, evenements, reponses, sports)
- **Calendrier** : vue des evenements a venir groupes par mois
- **Profil utilisateur** : informations, equipes, gestion des inscriptions aux sports

## Cas d'utilisation

### Utilisateur (role: utilisateur)

| # | Cas d'utilisation | Description |
|---|---|---|
| UC1 | S'inscrire | Creer un compte avec nom, prenom, email et mot de passe valide |
| UC2 | Se connecter / Se deconnecter | Authentification par email/mot de passe |
| UC3 | Consulter le tableau de bord | Voir ses equipes, evenements a venir, statistiques |
| UC4 | S'inscrire a un sport | Rejoindre la liste des pratiquants d'un sport (listeSportsInscript) |
| UC5 | Se desinscrire d'un sport | Quitter la liste des pratiquants |
| UC6 | Consulter les equipes | Voir toutes les equipes avec leurs membres et matchs |
| UC7 | Rejoindre une equipe | Etre ajoute a une equipe (relation appartenir, controle nombrePlaces) |
| UC8 | Quitter une equipe | Etre retire d'une equipe |
| UC9 | Consulter les evenements | Voir tous les evenements (simples et matchs) |
| UC10 | Repondre a un evenement | Indiquer sa presence : present, absent ou peut-etre (doit repondre) |
| UC11 | Consulter un match | Voir les equipes participantes, le gagnant, les reponses |
| UC12 | Consulter le calendrier | Vue chronologique des evenements a venir |
| UC13 | Consulter son profil | Voir ses informations, equipes et sports inscrits |

### Administrateur (role: admin) — herite de tous les UC utilisateur

| # | Cas d'utilisation | Description |
|---|---|---|
| UC14 | Creer un sport | Ajouter un nouveau sport au systeme |
| UC15 | Supprimer un sport | Supprimer un sport et ses evenements associes (cascade) |
| UC16 | Creer une equipe | Creer une equipe avec un nom et un nombre de places |
| UC17 | Supprimer une equipe | Supprimer une equipe (cascade sur appartenances et participations) |
| UC18 | Ajouter un membre a une equipe | Ajouter un utilisateur par email (controle capacite) |
| UC19 | Retirer un membre d'une equipe | Supprimer l'appartenance d'un utilisateur |
| UC20 | Creer un evenement | Creer un evenement lie a un sport avec titre, date, participants |
| UC21 | Creer un match | Creer un evenement de type match avec 2 equipes participantes (XT) |
| UC22 | Definir le gagnant d'un match | Designer l'equipe gagnante parmi les participantes (etre gagnant) |
| UC23 | Supprimer un evenement/match | Supprimer un evenement (cascade sur reponses et match) |

## Stack technique

| Technologie | Role |
|-------------|------|
| **NestJS 10** | Framework backend (API REST) |
| **React 18** | Frontend SPA |
| **Vite** | Build tool frontend |
| **TypeScript** | Typage statique |
| **SQLite** | Base de donnees relationnelle (fichier local) |
| **Prisma** | ORM (migrations, requetes, seed) |
| **Passport + JWT** | Authentification |
| **bcryptjs** | Hachage des mots de passe |
| **class-validator** | Validation des donnees (backend) |
| **Tailwind CSS** | Styling utilitaire |
| **React Router** | Navigation frontend |

## Prerequis

- **Node.js** 18+ et **npm**
- Aucune base de donnees a installer (SQLite, fichier local)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/DevDmCh214/LaLigueInformatique.git
cd LaLigueInformatique
```

### 2. Installer le backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed
```

### 3. Installer le frontend

```bash
cd ../frontend
npm install
```

### 4. Lancer l'application

Ouvrir **deux terminaux** :

**Terminal 1 — Backend (port 3000) :**
```bash
cd backend
npm run start:dev
```

**Terminal 2 — Frontend (port 5173) :**
```bash
cd frontend
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans le navigateur.

## Identifiants de demonstration

Tous les comptes ont le mot de passe : `Password1!`

| Email | Nom | Role | Equipe(s) | Sports inscrits |
|-------|-----|------|-----------|-----------------|
| alice@example.com | Alice Dupont | admin | FC Paris | Football, Basketball |
| bob@example.com | Bob Martin | admin | FC Paris, Marseille Volley | Football, Volleyball |
| claire@example.com | Claire Petit | admin | Lyon Basket | Basketball, Tennis |
| david@example.com | David Leroy | utilisateur | FC Paris, Lyon Basket | Football, Basketball |
| emma@example.com | Emma Bernard | utilisateur | Marseille Volley, OGC Nice | Volleyball, Tennis |
| francois@example.com | Francois Moreau | utilisateur | FC Paris, OGC Nice | Football, Basketball |

## Routes API

Toutes les routes sont prefixees par `/api` et protegees par JWT (sauf signup et login).

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/signup` | Inscription |
| POST | `/api/auth/login` | Connexion (retourne JWT) |
| GET | `/api/auth/me` | Profil utilisateur courant |
| GET | `/api/dashboard` | Stats du tableau de bord |
| GET/POST | `/api/sports` | Lister / Creer un sport |
| GET/PUT/DELETE | `/api/sports/:id` | Detail / Modifier / Supprimer |
| GET/POST | `/api/equipes` | Lister / Creer une equipe |
| GET/PUT/DELETE | `/api/equipes/:id` | Detail / Modifier / Supprimer |
| POST/DELETE | `/api/equipes/:id/membres` | Ajouter / Retirer un membre |
| GET/POST | `/api/evenements` | Lister / Creer un evenement |
| GET/PUT/DELETE | `/api/evenements/:id` | Detail / Modifier / Supprimer |
| GET/POST | `/api/matchs` | Lister / Creer un match (heritage XT) |
| GET/PUT/DELETE | `/api/matchs/:id` | Detail / Definir gagnant / Supprimer |
| POST | `/api/reponses` | Repondre a un evenement (upsert) |
| GET/POST/DELETE | `/api/inscriptions` | Inscriptions aux sports |

## Modele Conceptuel de Donnees (MCD)

```
Utilisateur --0,n-- doit repondre (reponse) --0,n-- Evenement
Utilisateur --0,n-- appartenir --0,n-- Equipe
Utilisateur --1,n-- listeSportsInscript --1,n-- Sport
Evenement --1,1-- concerne --0,n-- Sport
Evenement --XT (heritage)-- Match
Match --2,2-- participants --0,n-- Equipe
Match --0,1-- gagner --0,1-- Equipe
Equipe --1,1-- pratiquer --0,n-- Sport
```

## Commandes utiles

### Backend

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Lancer le serveur en mode developpement |
| `npm run build` | Compiler pour la production |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:seed` | Inserer les donnees de demo |
| `npm run db:studio` | Ouvrir Prisma Studio |

### Frontend

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur Vite |
| `npm run build` | Compiler pour la production |
| `npm run preview` | Preview de la build de production |
