# La Ligue Informatique — Gestion sportive

Application web de gestion sportive developpee dans le cadre du **BTS SIO SLAM** (epreuve E6). Elle permet de gerer des sports, des equipes, des evenements, des matchs (avec heritage XT) et les reponses de presence des membres.

## Fonctionnalites

- **Inscription / Connexion** securisee (bcrypt + JWT via NextAuth)
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

## Modele Conceptuel de Donnees (MCD)

```
Utilisateur ──0,n── doit repondre (reponse) ──0,n── Evenement
Utilisateur ──0,n── appartenir ──0,n── Equipe
Utilisateur ──1,n── listeSportsInscript ──1,n── Sport
Evenement ──1,1── doit avoir un seul ──0,n── Sport
Evenement ──XT (heritage)── Match
Match ──2,2── EquipesParticipantes ──0,n── Equipe
Match ──1,n── etre gagnant ──0,n── Equipe
```

### Entites

| Entite | Attributs |
|--------|-----------|
| **Utilisateur** | id, nom, prenom, email, mdp, role |
| **Sport** | id, nom |
| **Equipe** | id, nom, nombrePlaces |
| **Evenement** | id, participants, entitule, dateHeure, description |
| **Match** | (herite d'Evenement via XT) equipeGagnanteId |

### Relations

| Relation | Type | Cardinalites | Attribut(s) |
|----------|------|-------------|-------------|
| doit repondre | N,N porteuse | Utilisateur 0,n — Evenement 0,n | reponse (present/absent/peut-etre) |
| appartenir | N,N | Utilisateur 0,n — Equipe 0,n | — |
| listeSportsInscript | N,N | Utilisateur 1,n — Sport 1,n | — |
| doit avoir un seul | 1,N | Evenement 1,1 — Sport 0,n | — |
| EquipesParticipantes | N,N | Match 2,2 — Equipe 0,n | — |
| etre gagnant | N,N | Match 0,1 — Equipe 0,n | — |
| Heritage | Specialisation | Evenement → Match | Total, Exclusif |

### Schema relationnel (Prisma)

```
Utilisateur (id, nom, prenom, email, mdp, role)
Sport (id, nom)
Equipe (id, nom, nombrePlaces)
Evenement (id, participants, entitule, dateHeure, description, #sportId)
Match (id, #evenementId UNIQUE, #equipeGagnanteId?)
Reponse (id, reponse, #utilisateurId, #evenementId) UNIQUE(utilisateurId, evenementId)
Appartenir (id, #utilisateurId, #equipeId) UNIQUE(utilisateurId, equipeId)
EquipeParticipante (id, #matchId, #equipeId) UNIQUE(matchId, equipeId)
SportInscription (id, #utilisateurId, #sportId) UNIQUE(utilisateurId, sportId)
```

## Stack technique

| Technologie | Role |
|-------------|------|
| **Next.js 14** | Framework React full-stack (App Router) |
| **TypeScript** | Typage statique |
| **SQLite** | Base de donnees relationnelle (fichier local) |
| **Prisma** | ORM (migrations, requetes, seed) |
| **NextAuth.js** | Authentification (credentials + JWT) |
| **bcryptjs** | Hachage des mots de passe |
| **Zod** | Validation des donnees |
| **Tailwind CSS** | Styling utilitaire |

## Prerequis

- **Node.js** 18+ et **npm**
- Aucune base de donnees a installer (SQLite, fichier local)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/DevDmCh214/LaLigueInformatique.git
cd LaLigueInformatique
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Le fichier `.env` est pre-configure pour SQLite. Remplacer le secret NextAuth :

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="votre-secret-genere"
NEXTAUTH_URL="http://localhost:3000"
```

> Pour generer un secret : `openssl rand -base64 32`

### 4. Creer la base de donnees et appliquer les migrations

```bash
npx prisma migrate dev --name init
```

### 5. Inserer les donnees de demonstration

```bash
npm run db:seed
```

### 6. Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

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

## Structure du projet

```
LaLigueInformatique/
├── app/
│   ├── (auth)/                # Pages d'authentification
│   │   ├── login/             # Connexion
│   │   └── signup/            # Inscription (nom, prenom, email, mdp)
│   ├── (dashboard)/           # Pages protegees (authentifie)
│   │   ├── dashboard/         # Tableau de bord
│   │   ├── sports/            # Gestion des sports
│   │   │   ├── [id]/          # Detail + inscrits + evenements
│   │   │   └── new/           # Creer un sport
│   │   ├── equipes/           # Gestion des equipes
│   │   │   ├── [id]/          # Detail + membres + matchs
│   │   │   └── new/           # Creer une equipe
│   │   ├── evenements/        # Gestion des evenements
│   │   │   ├── [id]/          # Detail + reponses
│   │   │   └── new/           # Creer un evenement
│   │   ├── matchs/            # Gestion des matchs (heritage XT)
│   │   │   ├── [id]/          # Detail + equipes + gagnant + reponses
│   │   │   └── new/           # Creer un match (2 equipes)
│   │   ├── calendar/          # Calendrier
│   │   └── profil/            # Profil + inscriptions sports
│   └── api/                   # Routes API REST
│       ├── auth/              # Authentification (NextAuth + inscription)
│       ├── sports/            # CRUD sports
│       ├── equipes/           # CRUD equipes + membres
│       ├── evenements/        # CRUD evenements
│       ├── matchs/            # CRUD matchs (heritage XT d'evenement)
│       ├── reponses/          # Reponses aux evenements (upsert)
│       └── inscriptions/      # Inscriptions aux sports (toggle)
├── components/                # Composants React reutilisables
├── lib/                       # Utilitaires (Prisma, auth, validation Zod)
├── prisma/
│   ├── schema.prisma          # Schema de la base de donnees (MCD → MLD)
│   └── seed.ts                # Donnees de demonstration
├── types/                     # Declarations TypeScript (NextAuth)
└── middleware.ts              # Protection des routes (authentification)
```

## Routes API

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/signup` | Inscription (nom, prenom, email, mdp) |
| GET/POST | `/api/sports` | Lister / Creer un sport |
| GET/PUT/DELETE | `/api/sports/[id]` | Detail / Modifier / Supprimer un sport |
| GET/POST | `/api/equipes` | Lister / Creer une equipe |
| GET/PUT/DELETE | `/api/equipes/[id]` | Detail / Modifier / Supprimer une equipe |
| POST/DELETE | `/api/equipes/[id]/membres` | Ajouter / Retirer un membre |
| GET/POST | `/api/evenements` | Lister / Creer un evenement |
| GET/PUT/DELETE | `/api/evenements/[id]` | Detail / Modifier / Supprimer |
| GET/POST | `/api/matchs` | Lister / Creer un match (+ evenement parent XT) |
| GET/PUT/DELETE | `/api/matchs/[id]` | Detail / Definir gagnant / Supprimer |
| POST | `/api/reponses` | Repondre a un evenement (upsert) |
| GET/POST/DELETE | `/api/inscriptions` | Lister / S'inscrire / Se desinscrire d'un sport |

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur de developpement |
| `npm run build` | Compiler pour la production |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:seed` | Inserer les donnees de demo |
| `npm run db:studio` | Ouvrir Prisma Studio (interface BDD) |
