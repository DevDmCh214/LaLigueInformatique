# La Ligue Informatique

Application web de gestion de ligue sportive : equipes, evenements, matchs (avec heritage XT) et suivi de presence des membres. Developpee dans le cadre du **BTS SIO SLAM** (epreuve E6).

## Fonctionnalites principales

Les utilisateurs de cette application peuvent :
- S'inscrire a des sports et rejoindre des equipes avec controle de capacite
- Repondre aux evenements et matchs (present / absent / peut-etre)
- Consulter le calendrier des evenements a venir et le tableau de bord personnalise

Les administrateurs peuvent en plus :
- Gerer les sports, equipes, evenements et matchs (CRUD complet)
- Designer le gagnant d'un match lorsque tous les participants sont presents
- Ajouter/retirer des membres dans les equipes

## Prerequis

| Outil | Version minimum |
|-------|-----------------|
| Node.js | 18.x |
| npm | 9.x |

Aucune base de donnees externe a installer — SQLite est utilise via un fichier local.

## Installation

**1. Cloner le projet**
```bash
git clone https://github.com/DevDmCh214/LaLigueInformatique.git
cd LaLigueInformatique
```

**2. Installer le backend**
```bash
cd backend
npm install
```

**3. Configurer l'environnement**

Creer un fichier `.env` dans `backend/` :
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-jwt-ici"
```
> Generez un secret JWT avec : `openssl rand -base64 32`

**4. Initialiser la base de donnees**
```bash
npx prisma migrate dev
npm run db:seed
```

**5. Installer le frontend**
```bash
cd ../frontend
npm install
```

**6. Lancer l'application**

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

## Couverture de tests

**Backend (Jest) : 26 tests**
- Authentification et validation des credentials
- Sessions cote serveur et expiration
- Limitation de debit et protection brute-force
- Reponses aux evenements (upsert, contraintes)
- Validation des matchs et designation du gagnant

**Frontend (Jest) : 7 tests**
- Client HTTP et intercepteurs
- Gestion d'etat AuthContext

Lancer tous les tests :
```bash
npm test                # Backend + Frontend
npm run test:backend    # Backend uniquement (26 tests)
npm run test:frontend   # Frontend uniquement (7 tests)
```

## Comptes de demonstration

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

## Socle technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 (composants fonctionnels) |
| Styling | Tailwind CSS 3 |
| Routage client | React Router 6 |
| Backend | NestJS 10 (TypeScript) |
| Base de donnees | SQLite via Prisma 5 ORM |
| Authentification | JWT (Passport.js) + sessions cote serveur (expiration 30 min) |
| Hashage mot de passe | bcryptjs |
| Protection brute-force | Table `Connexion` + blocage IP apres 5 echecs en 30s |
| Build frontend | Vite 5 |
| Build backend | Nest CLI |
| Langage | TypeScript (strict) cote client et serveur |

## Architecture

```
LaLigueInformatique/
├── backend/                  ← API NestJS (port 3000)
│   ├── src/
│   │   ├── auth/             # Auth JWT, login/signup, validation de session, limitation de debit
│   │   ├── session/          # Gestion des sessions cote serveur + journal des connexions
│   │   ├── audit/            # Journal d'audit (INSERT/UPDATE/DELETE)
│   │   ├── dashboard/        # Endpoint statistiques utilisateur
│   │   ├── sports/           # CRUD Sport
│   │   ├── equipes/          # CRUD Equipe + gestion des membres + rejoindre/quitter
│   │   ├── evenements/       # CRUD Evenement
│   │   ├── matchs/           # CRUD Match (etend Evenement via heritage XT)
│   │   ├── reponses/         # Reponses aux evenements (present/absent/peut-etre)
│   │   ├── inscriptions/     # Inscriptions aux sports (utilisateur <-> sport)
│   │   └── prisma/           # Wrapper PrismaService
│   ├── prisma/
│   │   ├── schema.prisma     # Schema de la base de donnees
│   │   ├── seed.ts           # Donnees de demonstration
│   │   └── migrations/       # Migrations Prisma
│   └── .env                  # Variables d'environnement
├── frontend/                 ← SPA React (port 5173)
│   ├── src/
│   │   ├── pages/            # Pages de route (auth, sports, equipes, evenements, matchs, calendar, profil, dashboard)
│   │   ├── components/       # Layout, Navbar, ProtectedRoute, AdminRoute, SportSelectionModal
│   │   ├── context/          # AuthContext (etat d'authentification global)
│   │   └── api/              # Client HTTP (URL de base : http://localhost:3000/api)
│   └── package.json
└── package.json              # Scripts racine (test, seed, studio)
```

## Schema de la base de donnees

### Modeles principaux

| Modele | Description |
|--------|------------|
| `Utilisateur` | Utilisateurs avec mots de passe haches (bcrypt) et role (admin/utilisateur) |
| `Sport` | Sports avec suppression en cascade vers equipes et evenements |
| `Equipe` | Equipes appartenant a un sport, avec capacite (`nombrePlaces`) |
| `Evenement` | Evenements avec sport, date, nombre de participants |
| `Match` | Heritage XT d'Evenement — exactement 2 equipes par match |
| `Reponse` | N:N utilisateur-evenement (present/absent/peut-etre) |

### Modeles de securite et d'audit

| Modele | Description |
|--------|------------|
| `Session` | Sessions cote serveur avec UUID, suivi IP, expiration 30 min |
| `Connexion` | Journal des tentatives de login — IP, succes/echec, horodatage |
| `AuditLog` | Historique des modifications avec snapshots JSON avant/apres |

### Relations cles

```
Utilisateur ──0,n── Reponse ──0,n── Evenement
Utilisateur ──0,n── Appartenir ──0,n── Equipe
Utilisateur ──1,n── SportInscription ──1,n── Sport
Evenement ──1,1── Sport
Evenement ──XT── Match
Match ──2,2── EquipeParticipante ──0,n── Equipe
Match ──0,1── Equipe (gagnant)
Equipe ──1,1── Sport
Utilisateur ──0,n── Session
Utilisateur ──0,n── Connexion
```

- **Heritage XT** : `Match` a une relation 1:1 avec `Evenement` (cascade delete) — un match EST un evenement
- **Cardinalite 2,2** : chaque match a exactement 2 equipes participantes via `EquipeParticipante`
- **Toutes les FK** utilisent `onDelete: Cascade` — la suppression d'un sport entraine celle de ses equipes, evenements, matchs, appartenances et inscriptions
- **La suppression d'une equipe** entraine la suppression de tous les matchs auxquels elle participe

## Strategie d'authentification

Le systeme implemente une securite en couches :

| Mecanisme | Detail |
|-----------|--------|
| **Tokens JWT** | Contiennent `{ id, email, role, sessionId }` — stockes dans `localStorage` |
| **Sessions serveur** | Expirent apres 30 minutes, tracees dans la table `Session` avec IP |
| **Limitation de debit** | Apres 5 tentatives echouees en 30 secondes, l'IP est temporairement bloquee |
| **Journal des connexions** | Toutes les tentatives de login (succes/echec) dans la table `Connexion` |
| **Piste d'audit** | Operations INSERT/UPDATE/DELETE enregistrees dans `AuditLog` avec snapshots JSON |
| **Regles de mot de passe** | Min. 8 caracteres, 1 minuscule, 1 majuscule, 1 chiffre, 1 caractere special |

## Regles metier

### Utilisateur

- Doit s'inscrire a au moins un sport avant d'acceder a l'application
- Peut rejoindre une equipe s'il reste des places (en libre-service)
- Peut quitter une equipe a tout moment
- Se desinscrire d'un sport retire automatiquement l'utilisateur de toutes les equipes de ce sport
- Peut repondre aux evenements (present/absent/peut-etre)
- Ne peut repondre aux matchs que s'il est membre de l'une des deux equipes participantes
- Ne peut pas marquer "present" lorsque la limite de participants est atteinte

### Administrateur

- CRUD complet sur les sports, equipes, evenements et matchs
- La creation d'un match exige un nombre pair de participants, ne depassant pas la capacite de la plus petite equipe
- Ne peut designer le gagnant d'un match que lorsque tous les postes de participants sont pourvus
- Une fois le gagnant designe, le resultat ne peut plus etre modifie — le match passe en "Termine"
- La suppression d'un sport entraine en cascade : equipes, matchs, evenements, appartenances, inscriptions
- La suppression d'une equipe entraine la suppression de tous ses matchs

## Routes API

URL de base : `http://localhost:3000/api`

Toutes les routes sont protegees par JWT (sauf `POST /auth/signup` et `POST /auth/login`). Le token contient uniquement l'ID utilisateur, le role et l'ID de session — les donnees sont chargees cote serveur.

### Authentification

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/signup` | Inscription (retourne JWT) |
| POST | `/api/auth/login` | Connexion (retourne JWT avec sessionId) |
| POST | `/api/auth/logout` | Desactiver la session cote serveur |
| GET | `/api/auth/me` | Profil utilisateur courant (sports, appartenances) |

### Sports

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/sports` | Lister tous les sports |
| POST | `/api/sports` | Creer un sport *(admin)* |
| GET | `/api/sports/:id` | Detail d'un sport |
| PUT | `/api/sports/:id` | Modifier un sport *(admin)* |
| DELETE | `/api/sports/:id` | Supprimer un sport *(admin)* |

### Equipes

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/equipes` | Lister toutes les equipes |
| POST | `/api/equipes` | Creer une equipe *(admin)* |
| GET | `/api/equipes/:id` | Detail avec membres et matchs recents |
| PUT | `/api/equipes/:id` | Modifier une equipe *(admin)* |
| DELETE | `/api/equipes/:id` | Supprimer une equipe + ses matchs *(admin)* |
| POST | `/api/equipes/:id/join` | Rejoindre une equipe |
| DELETE | `/api/equipes/:id/leave` | Quitter une equipe |
| POST | `/api/equipes/:id/membres` | Ajouter un membre *(admin)* |
| DELETE | `/api/equipes/:id/membres` | Retirer un membre *(admin)* |

### Evenements

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/evenements` | Lister les evenements (`?sportId=` pour filtrer) |
| POST | `/api/evenements` | Creer un evenement *(admin)* |
| GET | `/api/evenements/:id` | Detail avec reponses |
| PUT | `/api/evenements/:id` | Modifier un evenement *(admin)* |
| DELETE | `/api/evenements/:id` | Supprimer un evenement *(admin)* |

### Matchs

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/matchs` | Lister tous les matchs |
| POST | `/api/matchs` | Creer un match (heritage XT) *(admin)* |
| GET | `/api/matchs/:id` | Detail avec equipes, reponses, gagnant |
| PUT | `/api/matchs/:id` | Definir le gagnant *(admin, irreversible)* |
| DELETE | `/api/matchs/:id` | Supprimer un match *(admin)* |

### Reponses & Inscriptions

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/reponses` | Repondre a un evenement (upsert) |
| GET | `/api/inscriptions` | Lister ses inscriptions aux sports |
| POST | `/api/inscriptions` | S'inscrire a un sport |
| DELETE | `/api/inscriptions` | Se desinscrire d'un sport |

### Dashboard

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/dashboard` | Statistiques personnalisees de l'utilisateur |

## Exemples de requetes API

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "mdp": "Ligue@2025!a"}'
```

Reponse :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Alice",
    "email": "alice@example.com",
    "role": "admin"
  }
}
```

### Creer un match (admin)
```bash
curl -X POST http://localhost:3000/api/matchs \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "entitule": "Finale Football",
    "participants": 6,
    "dateHeure": "2026-05-15T18:00:00.000Z",
    "sportId": 1,
    "equipe1Id": 1,
    "equipe2Id": 2
  }'
```

### Definir le gagnant (irreversible)
```bash
curl -X PUT http://localhost:3000/api/matchs/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"equipeGagnanteId": 1}'
```

### Repondre a un evenement
```bash
curl -X POST http://localhost:3000/api/reponses \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"evenementId": 1, "reponse": "present"}'
```

## Consulter les tables de securite

Les tables `Connexion`, `Session` et `AuditLog` ne sont pas exposees via l'API. Elles sont consultables de deux facons :

### Via Prisma Studio (interface graphique)

```bash
npm run db:studio    # depuis la racine
# ou
cd backend && npx prisma studio
```

Ouvre une interface web sur [http://localhost:5555](http://localhost:5555) pour naviguer dans toutes les tables, y compris `Connexion`, `Session` et `AuditLog`.

### Via SQLite en ligne de commande

```bash
cd backend/prisma
sqlite3 dev.db
```

**Voir les 10 dernieres tentatives de connexion :**
```sql
SELECT c.id, c.ipAddress, c.success, c.attemptedAt, u.email
FROM Connexion c
LEFT JOIN Utilisateur u ON c.utilisateurId = u.id
ORDER BY c.attemptedAt DESC
LIMIT 10;
```

**Voir les sessions actives :**
```sql
SELECT s.id, s.ipAddress, s.isActive, s.createdAt, s.expiresAt, u.email
FROM Session s
JOIN Utilisateur u ON s.utilisateurId = u.id
WHERE s.isActive = 1
ORDER BY s.createdAt DESC;
```

**Voir le journal d'audit (dernieres modifications) :**
```sql
SELECT id, tableName, action, recordId, createdAt,
       substr(oldState, 1, 80) AS old_preview,
       substr(newState, 1, 80) AS new_preview
FROM AuditLog
ORDER BY createdAt DESC
LIMIT 10;
```

**Compter les echecs de connexion par IP (detection brute-force) :**
```sql
SELECT ipAddress, COUNT(*) AS echecs, MAX(attemptedAt) AS derniere_tentative
FROM Connexion
WHERE success = 0
GROUP BY ipAddress
ORDER BY echecs DESC;
```

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm test` | Lancer tous les tests (backend + frontend) |
| `npm run test:backend` | Tests backend uniquement (26 tests) |
| `npm run test:frontend` | Tests frontend uniquement (7 tests) |
| `npm run db:seed` | Inserer les donnees de demonstration |
| `npm run db:studio` | Ouvrir Prisma Studio (interface graphique BDD) |

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
