# La Ligue Informatique

Application web de gestion de ligue sportive : équipes, événements, matchs et suivi de présence des membres.


# Cas d'utilisation
 
## Utilisateur (rôle: utilisateur)
 
| # | Cas d'utilisation | Description |
|---|---|---|
| UC1 | S'inscrire | Créer un compte avec nom, prénom, email et mot de passe valide |
| UC2 | Se connecter / Se déconnecter | Authentification par email/mot de passe |
| UC3 | Consulter le tableau de bord | Voir ses équipes, événements à venir, statistiques |
| UC4 | S'inscrire à un sport | Rejoindre la liste des pratiquants d'un sport (listeSportsInscript) |
| UC5 | Se désinscrire d'un sport | Quitter la liste des pratiquants |
| UC6 | Consulter les équipes | Voir toutes les équipes avec leurs membres et matchs |
| UC7 | Rejoindre une équipe | Être ajouté à une équipe (relation appartenir, contrôle nombrePlaces) |
| UC8 | Quitter une équipe | Être retiré d'une équipe |
| UC9 | Consulter les événements | Voir tous les événements (simples et matchs) |
| UC10 | Répondre à un événement | Indiquer sa présence : présent, absent ou peut-être (doit répondre) |
| UC11 | Consulter un match | Voir les équipes participantes, le gagnant, les réponses |
| UC12 | Consulter le calendrier | Vue chronologique des événements à venir |
| UC13 | Consulter son profil | Voir ses informations, équipes et sports inscrits |
 
## Administrateur (rôle: admin) — hérite de tous les UC utilisateur
 
| # | Cas d'utilisation | Description |
|---|---|---|
| UC14 | Créer un sport | Ajouter un nouveau sport au système |
| UC15 | Supprimer un sport | Supprimer un sport et ses événements associés (cascade) |
| UC16 | Créer une équipe | Créer une équipe avec un nom et un nombre de places |
| UC17 | Supprimer une équipe | Supprimer une équipe (cascade sur appartenances et participations) |
| UC18 | Ajouter un membre à une équipe | Ajouter un utilisateur par email (contrôle capacité) |
| UC19 | Retirer un membre d'une équipe | Supprimer l'appartenance d'un utilisateur |
| UC20 | Créer un événement | Créer un événement lié à un sport avec titre, date, participants |
| UC21 | Créer un match | Créer un événement de type match avec 2 équipes participantes (XT) |
| UC22 | Définir le gagnant d'un match | Désigner l'équipe gagnante parmi les participantes (être gagnant) |
| UC23 | Supprimer un événement/match | Supprimer un événement (cascade sur réponses et match) |
 

## Prérequis

| Outil | Version minimum |
|-------|-----------------|
| Node.js | 18.x |
| npm | 9.x |

Aucune base de données externe à installer — SQLite est utilisé via un fichier local.

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

Créer un fichier `.env` dans `backend/` :
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-jwt-ici"
```
> Générez un secret JWT avec : `openssl rand -base64 32`

**4. Initialiser la base de données**
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
- Authentification et validation des identifiants
- Sessions côté serveur et expiration
- Limitation de débit et protection brute-force
- Réponses aux événements (upsert, contraintes)
- Validation des matchs et désignation du gagnant

**Frontend (Jest) : 7 tests**
- Client HTTP et intercepteurs
- Gestion d'état AuthContext

Lancer tous les tests :
```bash
npm test                # Backend + Frontend
npm run test:backend    # Backend uniquement (26 tests)
npm run test:frontend   # Frontend uniquement (7 tests)
```

## Comptes de démonstration

| Email | Mot de passe | Rôle | Sports |
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


## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 (composants fonctionnels) |
| Styling | Tailwind CSS 3 |
| Backend | NestJS 10 (TypeScript) |
| Base de données | SQLite via Prisma 5 ORM |
| Authentification | JWT (Passport.js) + sessions côté serveur (expiration 30 min) |
| Hachage mot de passe | bcryptjs |
| Langage | TypeScript côté client et serveur |

## Architecture

```
LaLigueInformatique/
├── backend/                  ← API NestJS (port 3000)
│   ├── src/
│   │   ├── auth/             # Auth JWT, login/signup, validation de session, limitation de débit
│   │   ├── session/          # Gestion des sessions côté serveur + journal des connexions
│   │   ├── audit/            # Journal d'audit (INSERT/UPDATE/DELETE)
│   │   ├── dashboard/        # Endpoint statistiques utilisateur
│   │   ├── sports/           # CRUD Sport
│   │   ├── equipes/          # CRUD Équipe + gestion des membres + rejoindre/quitter
│   │   ├── evenements/       # CRUD Événement
│   │   ├── matchs/           # CRUD Match (étend Événement via héritage XT)
│   │   ├── reponses/         # Réponses aux événements (présent/absent/peut-être)
│   │   ├── inscriptions/     # Inscriptions aux sports (utilisateur <-> sport)
│   │   └── prisma/           # Wrapper PrismaService
│   ├── prisma/
│   │   ├── schema.prisma     # Schéma de la base de données
│   │   ├── seed.ts           # Données de démonstration
│   │   └── migrations/       # Migrations Prisma
│   └── .env                  # Variables d'environnement
├── frontend/                 ← SPA React (port 5173)
│   ├── src/
│   │   ├── pages/            # Pages de route (auth, sports, équipes, événements, matchs, calendar, profil, dashboard)
│   │   ├── components/       # Layout, Navbar, ProtectedRoute, AdminRoute, SportSelectionModal
│   │   ├── context/          # AuthContext (état d'authentification global)
│   │   └── api/              # Client HTTP (URL de base : http://localhost:3000/api)
│   └── package.json
└── package.json              # Scripts racine (test, seed, studio)
```

## Schéma de la base de données

### Modèles principaux

| Modèle | Description |
|--------|------------|
| `Utilisateur` | Utilisateurs avec mots de passe hachés (bcrypt) et rôle (admin/utilisateur) |
| `Sport` | Sports avec suppression en cascade vers équipes et événements |
| `Équipe` | Équipes appartenant à un sport, avec capacité (`nombrePlaces`) |
| `Événement` | Événements avec sport, date, nombre de participants |
| `Match` | Héritage XT d'Événement — exactement 2 équipes par match |
| `Réponse` | N:N utilisateur-événement (présent/absent/peut-être) |


## Stratégie d'authentification

Le système implémente une sécurité en couches :

| Mécanisme | Détail |
|-----------|--------|
| **Tokens JWT** | Contiennent `{ id, email, role, sessionId }` — stockés dans `localStorage` |
| **Sessions serveur** | Expirent après 30 minutes, tracées dans la table `Session` avec IP |
| **Limitation de débit** | Après 5 tentatives échouées en 30 secondes, l'IP est temporairement bloquée |
| **Journal des connexions** | Toutes les tentatives de login (succès/échec) dans la table `Connexion` |
| **Piste d'audit** | Opérations INSERT/UPDATE/DELETE enregistrées dans `AuditLog` avec snapshots JSON |
| **Règles de mot de passe** | Min. 8 caractères, 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial |

## Règles métier

### Utilisateur

- Doit s'inscrire à au moins un sport avant d'accéder à l'application
- Peut rejoindre une équipe s'il reste des places (en libre-service)
- Peut quitter une équipe à tout moment
- Se désinscrire d'un sport retire automatiquement l'utilisateur de toutes les équipes de ce sport
- Peut répondre aux événements (présent/absent/peut-être)
- Ne peut répondre aux matchs que s'il est membre de l'une des deux équipes participantes
- Ne peut pas marquer "présent" lorsque la limite de participants est atteinte

### Administrateur

- CRUD complet sur les sports, équipes, événements et matchs
- La création d'un match exige un nombre pair de participants, ne dépassant pas la capacité de la plus petite équipe
- Ne peut désigner le gagnant d'un match que lorsque tous les postes de participants sont pourvus
- Une fois le gagnant désigné, le résultat ne peut plus être modifié — le match passe en "Terminé"
- La suppression d'un sport entraîne en cascade : équipes, matchs, événements, appartenances, inscriptions
- La suppression d'une équipe entraîne la suppression de tous ses matchs

## Routes API

URL de base : `http://localhost:3000/api`

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/signup` | Créer un compte |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Profil utilisateur actuel |

### Sports

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/sports` | Lister tous les sports |
| POST | `/api/sports` | Créer un sport *(admin)* |
| GET | `/api/sports/:id` | Détail d'un sport |
| PUT | `/api/sports/:id` | Modifier un sport *(admin)* |
| DELETE | `/api/sports/:id` | Supprimer un sport *(admin)* |

### Équipes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/equipes` | Lister toutes les équipes |
| POST | `/api/equipes` | Créer une équipe *(admin)* |
| GET | `/api/equipes/:id` | Détail avec membres et matchs récents |
| PUT | `/api/equipes/:id` | Modifier une équipe *(admin)* |
| DELETE | `/api/equipes/:id` | Supprimer une équipe + ses matchs *(admin)* |
| POST | `/api/equipes/:id/join` | Rejoindre une équipe |
| DELETE | `/api/equipes/:id/leave` | Quitter une équipe |
| POST | `/api/equipes/:id/membres` | Ajouter un membre *(admin)* |
| DELETE | `/api/equipes/:id/membres` | Retirer un membre *(admin)* |

### Événements

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/evenements` | Lister les événements (`?sportId=` pour filtrer) |
| POST | `/api/evenements` | Créer un événement *(admin)* |
| GET | `/api/evenements/:id` | Détail avec réponses |
| PUT | `/api/evenements/:id` | Modifier un événement *(admin)* |
| DELETE | `/api/evenements/:id` | Supprimer un événement *(admin)* |

### Matchs

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/matchs` | Lister tous les matchs |
| POST | `/api/matchs` | Créer un match (héritage XT) *(admin)* |
| GET | `/api/matchs/:id` | Détail avec équipes, réponses, gagnant |
| PUT | `/api/matchs/:id` | Définir le gagnant *(admin, irréversible)* |
| DELETE | `/api/matchs/:id` | Supprimer un match *(admin)* |

### Réponses & Inscriptions

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/reponses` | Répondre à un événement (upsert) |
| GET | `/api/inscriptions` | Lister ses inscriptions aux sports |
| POST | `/api/inscriptions` | S'inscrire à un sport |
| DELETE | `/api/inscriptions` | Se désinscrire d'un sport |

### Dashboard

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/dashboard` | Statistiques personnalisées de l'utilisateur |

## Exemples de requêtes API

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "mdp": "Ligue@2025!a"}'
```

Réponse :
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

### Créer un match (admin)
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

### Définir le gagnant (irréversible)
```bash
curl -X PUT http://localhost:3000/api/matchs/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"equipeGagnanteId": 1}'
```

### Répondre à un événement
```bash
curl -X POST http://localhost:3000/api/reponses \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"evenementId": 1, "reponse": "present"}'
```

## Consulter les tables de sécurité

Les tables `Connexion`, `Session` et `AuditLog` ne sont pas exposées via l'API. Elles sont consultables de deux façons :

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

**Voir les 10 dernières tentatives de connexion :**
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

**Voir le journal d'audit (dernières modifications) :**
```sql
SELECT id, tableName, action, recordId, createdAt,
       substr(oldState, 1, 80) AS old_preview,
       substr(newState, 1, 80) AS new_preview
FROM AuditLog
ORDER BY createdAt DESC
LIMIT 10;
```

**Compter les échecs de connexion par IP (détection brute-force) :**
```sql
SELECT ipAddress, COUNT(*) AS echecs, MAX(attemptedAt) AS derniere_tentative
FROM Connexion
WHERE success = 0
GROUP BY ipAddress
ORDER BY echecs DESC;
```


## Décisions d'architecture

| Décision | Raison |
|----------|--------|
| SQLite comme base de données | Aucune installation externe requise — un simple fichier `dev.db` suffit. Idéal pour le développement local et la démonstration |
| Prisma ORM avec migrations | Schéma versionné, typage TypeScript automatique, migrations reproductibles entre environnements |
| Héritage pour Match/Événement | Un match EST un événement (relation 1:1 avec cascade delete). Permet de partager la logique de réponses sans dupliquer les tables |
| JWT minimal `{ id, email, role, sessionId }` dans localStorage | Le token ne stocke que l'identifiant et le rôle. Les données utilisateur sont chargées côté serveur via `/auth/me` |
| Sessions côté serveur (table `Session`) | Permet l'invalidation immédiate (logout, expiration 30 min) sans attendre l'expiration du JWT |
| Rate limiting par IP (table `Connexion`) | Après 5 échecs de connexion en 30 s, l'IP est temporairement bloquée. Protection brute-force sans dépendance externe |
| Journal d'audit applicatif (table `AuditLog`) | Toutes les opérations INSERT/UPDATE/DELETE sur les tables métier sont tracées avec snapshots JSON avant/après, directement dans le code NestJS via `AuditService` |
| Mots de passe hachés et salés (bcrypt) | Chaque mot de passe est salé individuellement par bcryptjs avant stockage. Politique stricte : min. 8 caractères, majuscule, minuscule, chiffre, caractère spécial |
| Suppression en cascade sur toutes les FK | La suppression d'un sport entraîne celle de ses équipes, événements, matchs, appartenances et inscriptions. La suppression d'une équipe entraîne celle de ses matchs |
| Résultat de match irréversible | Une fois le gagnant désigné, le résultat ne peut plus être modifié — ni côté frontend ni côté backend. Garantit l'intégrité des résultats |
| Filtrage par sports inscrits côté frontend | `subscribedSportIds` depuis `AuthContext` filtre équipes, événements, matchs et calendrier. L'utilisateur ne voit que les données de ses sports |
| Sélection de sport obligatoire avant accès | `SportSelectionModal` bloque toutes les routes tant que l'utilisateur n'a pas choisi au moins un sport |
| Tables de sécurité non exposées via API | `Connexion`, `Session` et `AuditLog` sont consultables uniquement via Prisma Studio ou SQLite CLI — pas d'endpoint public |

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm test` | Lancer tous les tests (backend + frontend) |
| `npm run test:backend` | Tests backend uniquement (26 tests) |
| `npm run test:frontend` | Tests frontend uniquement (7 tests) |
| `npm run db:seed` | Insérer les données de démonstration |
| `npm run db:studio` | Ouvrir Prisma Studio (interface graphique BDD) |

### Backend (`cd backend`)

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Démarrer le serveur de dev avec rechargement auto |
| `npm run build` | Compiler pour la production |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:seed` | Insérer les données de démonstration |
| `npm run db:studio` | Ouvrir Prisma Studio |

### Frontend (`cd frontend`)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrer le serveur Vite |
| `npm run build` | Compiler pour la production |
| `npm run preview` | Prévisualiser la build de production |
