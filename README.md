# La Ligue Informatique — Gestion de ligue sportive

La Ligue Informatique est une application web de gestion de ligue sportive : equipes, evenements, matchs (avec heritage XT) et suivi de presence des membres. Developpee dans le cadre du **BTS SIO SLAM** (epreuve E6).

## Fonctionnalites principales

- Gerer une ligue multi-sports avec equipes, evenements et matchs
- S'inscrire a des sports et rejoindre des equipes avec controle de capacite
- Repondre aux evenements et matchs (present / absent / peut-etre)
- Suivi des resultats de matchs avec designation du gagnant
- Tableau de bord personnalise avec statistiques
- Vue calendrier des evenements a venir

## Socle technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 18 avec Tailwind CSS 3 et React Router 6 |
| **Backend** | NestJS 10 avec authentification JWT (Passport.js) |
| **Base de donnees** | SQLite via Prisma 5 ORM (aucune BDD externe requise) |
| **Langage** | TypeScript (strict) cote client et serveur |
| **Build** | Vite 5 (frontend), Nest CLI (backend) |

## Prerequis

- **Node.js** 18+ et **npm**
- Aucune base de donnees externe a installer (SQLite, fichier local)

## Strategie d'authentification

Le systeme implemente une securite en couches :

- **Tokens JWT** contiennent `{ id, email, role, sessionId }` — les donnees utilisateur sont recuperees cote serveur
- **Sessions cote serveur** expirent apres 30 minutes, tracees dans la table `Session` avec enregistrement de l'IP
- **Limitation de debit** : apres 5 tentatives echouees en 30 secondes, l'IP est temporairement bloquee
- **Journal des connexions** : toutes les tentatives de login (succes et echec) sont enregistrees dans la table `Connexion`
- **Piste d'audit** : toutes les operations INSERT / UPDATE / DELETE sur les tables cles sont enregistrees dans `AuditLog` avec des snapshots JSON avant/apres
- **Regles de mot de passe** : au moins 8 caracteres, au moins une minuscule, au moins une majuscule, au moins un chiffre, au moins un caractere special

## Couverture de tests

- **Backend** : 26 tests couvrant l'authentification, les sessions, la limitation de debit, les reponses, la validation des matchs
- **Frontend** : 7 tests couvrant le client API et la gestion d'etat AuthContext

Lancer tous les tests avec une seule commande :

```bash
npm test
```

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
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Editez le fichier `.env` si necessaire (les valeurs par defaut fonctionnent pour le developpement local).

### 4. Initialiser la base de donnees

```bash
npx prisma migrate dev
npm run db:seed
```

### 5. Installer le frontend

```bash
cd ../frontend
npm install
```

### 6. Lancer l'application

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

## Comptes de demonstration

Chaque utilisateur dispose d'un mot de passe unique et complexe respectant les regles de securite :

| Email | Mot de passe | Role | Sports |
|-------|-------------|------|--------|
| alice@example.com | `Ligue@2025!a` | admin | Football, Basketball |
| bob@example.com | `Sport#B8x` | admin | Football, Volleyball |
| claire@example.com | `Equipe$C94` | admin | Basketball, Course |
| david@example.com | `Match&D7m` | utilisateur | Football, Basketball |
| emma@example.com | `Volley!E3v` | utilisateur | Volleyball, Course |
| francois@example.com | `Foot@F5f` | utilisateur | Football, Basketball |
| gabriel@example.com | `Basket#G2b` | utilisateur | Football, Basketball |
| helene@example.com | `Course$H6c` | utilisateur | Volleyball, Course |
| isaac@example.com | `Ligue&I9l` | utilisateur | Football, Course |
| julie@example.com | `Sport!J4s` | utilisateur | Basketball, Volleyball |
| kevin@example.com | `Match@K1m` | utilisateur | Football, Volleyball |
| laura@example.com | `Equipe#L7e` | utilisateur | Basketball, Course |

**Match pret a demonstrer** : Lyon Basket vs Paris Basket (6/6 participants presents — l'admin peut designer le gagnant immediatement).

## Architecture

```
LaLigueInformatique/
├── backend/                ← API NestJS (port 3000)
│   ├── src/
│   │   ├── auth/           # Auth JWT, login/signup, validation de session, limitation de debit
│   │   ├── session/        # Gestion des sessions cote serveur + journal des connexions
│   │   ├── audit/          # Journal d'audit (INSERT/UPDATE/DELETE)
│   │   ├── dashboard/      # Endpoint statistiques utilisateur
│   │   ├── sports/         # CRUD Sport
│   │   ├── equipes/        # CRUD Equipe + gestion des membres + rejoindre/quitter
│   │   ├── evenements/     # CRUD Evenement
│   │   ├── matchs/         # CRUD Match (etend Evenement via heritage XT)
│   │   ├── reponses/       # Reponses aux evenements (present/absent/peut-etre)
│   │   ├── inscriptions/   # Inscriptions aux sports (utilisateur <-> sport)
│   │   └── prisma/         # Wrapper PrismaService
│   ├── prisma/
│   │   ├── schema.prisma   # Schema de la base de donnees
│   │   ├── seed.ts         # Donnees de demonstration
│   │   └── migrations/     # Migrations Prisma
│   ├── .env.example        # Variables d'environnement (a copier en .env)
│   └── package.json
├── frontend/               ← SPA React (port 5173)
│   ├── src/
│   │   ├── pages/          # Pages de route
│   │   ├── components/     # Layout, Navbar, ProtectedRoute, AdminRoute
│   │   ├── context/        # AuthContext (etat d'authentification global)
│   │   └── api/            # Client HTTP (URL de base : http://localhost:3000/api)
│   └── package.json
└── package.json            # Scripts racine (test, seed, studio)
```

## Schema de la base de donnees

### Modeles principaux

| Modele | Description |
|--------|------------|
| `Utilisateur` | Utilisateurs avec mots de passe haches (bcrypt) et role (admin/utilisateur) |
| `Sport` | Sports avec suppression en cascade vers equipes et evenements |
| `Equipe` | Equipes appartenant a un sport, avec capacite (nombrePlaces) |
| `Evenement` | Evenements avec sport, date, nombre de participants |
| `Match` | Heritage XT d'Evenement — exactement 2 equipes par match |
| `Reponse` | N:N utilisateur-evenement (present/absent/peut-etre) |

### Modeles de securite et d'audit

| Modele | Description |
|--------|------------|
| `Session` | Sessions cote serveur avec UUID, suivi IP, expiration 30min |
| `Connexion` | Journal des tentatives de login — IP, succes/echec, horodatage |
| `AuditLog` | Historique des modifications avec snapshots JSON avant/apres |

### Relations cles

```
Utilisateur --0,n-- Reponse --0,n-- Evenement
Utilisateur --0,n-- Appartenir --0,n-- Equipe
Utilisateur --1,n-- SportInscription --1,n-- Sport
Evenement --1,1-- Sport
Evenement --XT-- Match
Match --2,2-- EquipeParticipante --0,n-- Equipe
Match --0,1-- Equipe (gagnant)
Equipe --1,1-- Sport
Utilisateur --0,n-- Session
Utilisateur --0,n-- Connexion
```

## Regles metier

### Capacites utilisateur

- Doit s'inscrire a au moins un sport avant d'acceder a l'application
- Peut rejoindre une equipe s'il reste des places (en libre-service)
- Peut quitter une equipe a tout moment
- Se desinscrire d'un sport retire automatiquement l'utilisateur de toutes les equipes de ce sport
- Peut repondre aux evenements (present/absent/peut-etre)
- Ne peut repondre aux matchs que s'il est membre de l'une des deux equipes participantes
- Ne peut pas marquer "present" lorsque la limite de participants est atteinte

### Capacites administrateur

- CRUD complet sur les sports, equipes, evenements et matchs
- La suppression d'un sport entraine en cascade : equipes, matchs, evenements, appartenances, inscriptions
- La creation d'un match exige un nombre pair de participants, ne depassant pas la capacite de la plus petite equipe
- Ne peut designer le gagnant d'un match que lorsque tous les postes de participants sont pourvus (nb presents = nb participants)

## Routes API

Toutes les routes sont prefixees par `/api`, protegees par JWT (sauf signup et login).

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/signup` | Inscription |
| POST | `/api/auth/login` | Connexion (retourne JWT avec sessionId) |
| POST | `/api/auth/logout` | Desactiver la session cote serveur |
| GET | `/api/auth/me` | Profil utilisateur courant |
| GET | `/api/dashboard` | Statistiques du tableau de bord |
| GET/POST | `/api/sports` | Lister / Creer un sport |
| GET/PUT/DELETE | `/api/sports/:id` | Detail / Modifier / Supprimer |
| GET/POST | `/api/equipes` | Lister / Creer une equipe |
| GET/PUT/DELETE | `/api/equipes/:id` | Detail / Modifier / Supprimer |
| POST | `/api/equipes/:id/join` | Rejoindre une equipe |
| DELETE | `/api/equipes/:id/leave` | Quitter une equipe |
| POST/DELETE | `/api/equipes/:id/membres` | Admin : ajouter/retirer un membre |
| GET/POST | `/api/evenements` | Lister / Creer un evenement |
| GET/PUT/DELETE | `/api/evenements/:id` | Detail / Modifier / Supprimer |
| GET/POST | `/api/matchs` | Lister / Creer un match (heritage XT) |
| GET/PUT/DELETE | `/api/matchs/:id` | Detail / Definir gagnant / Supprimer |
| POST | `/api/reponses` | Repondre a un evenement (upsert) |
| GET/POST/DELETE | `/api/inscriptions` | Inscriptions aux sports |

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm test` | Lancer tous les tests (backend + frontend) |
| `npm run test:backend` | Lancer les tests backend uniquement (26 tests) |
| `npm run test:frontend` | Lancer les tests frontend uniquement (7 tests) |

### Backend (`cd backend`)

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Demarrer le serveur de dev avec rechargement auto |
| `npm run build` | Compiler pour la production |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:seed` | Inserer les donnees de demonstration |
| `npm run db:studio` | Ouvrir Prisma Studio |

### Frontend (`cd frontend`)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Demarrer le serveur Vite |
| `npm run build` | Compiler pour la production |
| `npm run preview` | Previsualiser la build de production |
