# La Ligue Informatique — Gestion d'équipes sportives

Application web de gestion d'équipes sportives développée dans le cadre du **BTS SIO SLAM** (épreuve E6). Elle permet de gérer des équipes, des joueurs, des événements (matchs et entraînements) et les réponses de présence (RSVP) des membres.

## Fonctionnalités

- **Inscription** avec validation de complexité du mot de passe (min. 8 caractères, majuscule, minuscule, chiffre, caractère spécial)
- **Connexion / Déconnexion** sécurisée (mot de passe chiffré avec bcrypt)
- **Tableau de bord** avec résumé des équipes, événements à venir et RSVPs
- **Gestion des équipes** : créer, consulter, supprimer une équipe (CRUD)
- **Gestion des joueurs** : ajouter, modifier, supprimer des joueurs dans une équipe (**relation 1,N** : Team → Player)
- **Gestion des événements** : créer, consulter, supprimer des événements (matchs, entraînements) — **CRUD complet**
- **Système RSVP** : répondre présent/absent/peut-être à un événement (**relation N,N porteuse de données** : User ↔ Event via RSVP avec statut)
- **Calendrier** : vue des événements à venir groupés par mois
- **Membres d'équipe** : association N,N User ↔ Team via TeamMember avec rôle (admin/member)

## Modèle de données

```
User ──1,N──> TeamMember <──1,N── Team
User ──1,N──> RSVP       <──1,N── Event
Team ──1,N──> Player
Team ──1,N──> Event
```

### Relations clés

| Relation | Type | Description |
|----------|------|-------------|
| Team → Player | 1,N | Une équipe possède plusieurs joueurs |
| User ↔ Event via RSVP | N,N (porteuse) | Un utilisateur peut répondre à plusieurs événements, un événement a plusieurs réponses. Le statut (going/not_going/maybe) est porté par la table RSVP |
| User ↔ Team via TeamMember | N,N (porteuse) | Un utilisateur peut être membre de plusieurs équipes avec un rôle (admin/member) |

## Stack technique

| Technologie | Rôle |
|-------------|------|
| **Next.js 14** | Framework React full-stack (App Router) |
| **TypeScript** | Typage statique |
| **SQLite** | Base de données relationnelle (fichier local) |
| **Prisma** | ORM (migrations, requêtes, seed) |
| **NextAuth.js** | Authentification (credentials + JWT) |
| **bcryptjs** | Hachage des mots de passe |
| **Zod** | Validation des données |
| **Tailwind CSS** | Styling utilitaire |

## Prérequis

- **Node.js** 18+ et **npm**
- Aucune base de données à installer (SQLite, fichier local)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/DevDmCh214/LaLigueInformatique.git
cd LaLigueInformatique
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

Le fichier `.env` est pré-configuré pour SQLite. Il suffit de remplacer le secret NextAuth :

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="votre-secret-genere"
NEXTAUTH_URL="http://localhost:3000"
```

> Pour générer un secret : `openssl rand -base64 32` (ou inventez une chaîne longue)

### 4. Créer la base de données et appliquer les migrations

```bash
npx prisma migrate dev --name init
```

### 5. Insérer les données de démonstration

```bash
npm run db:seed
```

### 6. Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## Identifiants de démonstration

Tous les comptes ont le mot de passe : `Password1!`

| Email | Nom | Équipe(s) | Rôle |
|-------|-----|-----------|------|
| alice@example.com | Alice Dupont | FC Paris | Admin |
| bob@example.com | Bob Martin | FC Paris, Lyon Basket | Membre |
| claire@example.com | Claire Petit | Lyon Basket | Admin |
| david@example.com | David Leroy | Lyon Basket | Membre |

## Structure du projet

```
LaLigueInformatique/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   │   ├── login/           # Page de connexion
│   │   └── signup/          # Page d'inscription
│   ├── (dashboard)/         # Pages protégées (authentifié)
│   │   ├── dashboard/       # Tableau de bord
│   │   ├── teams/           # Gestion des équipes
│   │   │   ├── [id]/        # Détail d'une équipe + joueurs
│   │   │   └── new/         # Créer une équipe
│   │   ├── events/          # Gestion des événements
│   │   │   ├── [id]/        # Détail d'un événement + RSVP
│   │   │   └── new/         # Créer un événement
│   │   └── calendar/        # Calendrier des événements
│   └── api/                 # Routes API REST
│       ├── auth/            # Authentification (NextAuth + inscription)
│       ├── teams/           # CRUD équipes
│       ├── players/         # CRUD joueurs
│       ├── events/          # CRUD événements
│       └── rsvp/            # Gestion des RSVP
├── components/              # Composants React réutilisables
├── lib/                     # Utilitaires (Prisma, auth, validation)
├── prisma/
│   ├── schema.prisma        # Schéma de la base de données
│   └── seed.ts              # Données de démonstration
├── types/                   # Déclarations TypeScript
└── README.md
```

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Compiler pour la production |
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:seed` | Insérer les données de démo |
| `npm run db:studio` | Ouvrir Prisma Studio (interface BDD) |

