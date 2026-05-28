# YEDIDIA ESTATE — Briefing Complet pour Claude Code
> **Document de référence officiel** — À lire intégralement avant toute action sur le projet.  
> Dernière mise à jour : Mai 2026

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Stack technique](#2-stack-technique)
3. [Règles absolues à respecter](#3-règles-absolues-à-respecter)
4. [Structure des fichiers du projet](#4-structure-des-fichiers-du-projet)
5. [Base de données — Schéma complet](#5-base-de-données--schéma-complet)
6. [Architecture des rôles et accès](#6-architecture-des-rôles-et-accès)
7. [Logique métier détaillée](#7-logique-métier-détaillée)
8. [Ce qui a déjà été développé (BLOCS VALIDÉS)](#8-ce-qui-a-déjà-été-développé-blocs-validés)
9. [Ce qui reste à faire (BLOCS EN COURS / À FAIRE)](#9-ce-qui-reste-à-faire-blocs-en-cours--à-faire)
10. [Fichiers de configuration centraux](#10-fichiers-de-configuration-centraux)
11. [Variables d'environnement (.env.local)](#11-variables-denvironnement-envlocal)
12. [Contraintes médias](#12-contraintes-médias)
13. [Système de paiement](#13-système-de-paiement)
14. [Emails transactionnels](#14-emails-transactionnels)
15. [Sécurité](#15-sécurité)
16. [Déploiement prévu](#16-déploiement-prévu)

---

## 1. VUE D'ENSEMBLE DU PROJET

**Nom de la plateforme :** Yedidia Estate  
**Langue unique :** Anglais  
**Marché cible :** Ghana (résidents ghanéens)  
**Couleur principale :** Rose (`#e23d76`) — le reste est complété par le design  
**Police principale :** Plus Jakarta Sans  
**Éléments visuels :** Drapeau ghanéen 🇬🇭 et éléments Kente intégrés dans le design  

### Description
Plateforme immobilière ghanéenne permettant à des **Agents Immobiliers** de publier des annonces de biens (parcelles, maisons à louer, Airbnb, maisons à vendre). Le site se présente **comme une boutique d'entreprise** (pas comme un site d'annonces classique) : les visiteurs voient les publications sans savoir qu'elles viennent d'agents externes. 90% des utilisateurs sont sur mobile Android/iOS — le responsive mobile-first est une priorité absolue.

### Types de biens
| Type | Code DB | Médias |
|------|---------|--------|
| Parcelle à vendre | `parcelle` | Vidéo uniquement (obligatoire) |
| Maison à louer | `maison_location` | Photos uniquement (max 6) |
| Appartement meublé Airbnb | `airbnb` | Photos uniquement (max 6) |
| Maison à vendre | `maison_vente` | Photos uniquement (max 6) |

---

## 2. STACK TECHNIQUE

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (App Router) | 15.3.8 |
| Langage | TypeScript | Latest |
| CSS | Tailwind CSS | **3.4.17** (pas la v4) |
| Base de données | PostgreSQL via Supabase | Latest |
| ORM/Client DB | @supabase/supabase-js | Latest |
| Auth (hachage) | Argon2 (argon2id) | Latest |
| Sessions | JWT (jsonwebtoken) + cookies HttpOnly | Latest |
| Emails | **Resend** (PAS Nodemailer, PAS SMTP) | Latest |
| Paiement | Paystack | Latest |
| Upload médias | Supabase Storage (bucket: `yedidia-media`) | — |
| Validation | Zod | Latest |
| Dates | date-fns | Latest |
| Cron jobs | Vercel Cron Jobs (en prod) / node-cron (en dev) | — |
| Éditeur | WebStorm | — |
| Déploiement | Vercel (front) + Supabase (DB + Storage) | — |
| Dev local DB | PgAdmin4 + PostgreSQL local | — |

---

## 3. RÈGLES ABSOLUES À RESPECTER

> ⚠️ Ces règles ont été définies avec le client et ne doivent **jamais** être violées.

### 3.1 Convention de fichiers
- **La première ligne de CHAQUE fichier de code est un commentaire indiquant le chemin du fichier.**
  ```ts
  // app/agents/dashboard/page.tsx
  ```
- Chaque page doit avoir ses composants dans des fichiers séparés (les pages restent légères).
- Les composants de cards/tableaux/formulaires sont dans des fichiers dédiés dans `components/`.

### 3.2 Structure des dossiers
- **Pas de dossier `/src`** — on suit la convention Next.js standard : `app/`, `components/`, `lib/`, `config/` directement à la racine.
- Convention App Router de Next.js uniquement (pas de Pages Router).
- Les routes publiques sont dans `app/(public)/` (groupe de routes).

### 3.3 Tailwind CSS
- **Version 3.4.17 obligatoire** — la v4 est trop récente et cause des erreurs.
- Utiliser uniquement les classes Tailwind standard + les couleurs `brand` définies dans `tailwind.config.js`.

### 3.4 Sécurité
- **Argon2id** pour tous les hachages de mots de passe. Jamais bcrypt ou autre.
- **JWT** signé HS256 avec `JWT_SECRET` depuis `.env.local`.
- **Cookies HttpOnly** pour les sessions (jamais localStorage).
- Le SuperAdmin n'est **jamais** créé en base de données — ses credentials sont uniquement dans `.env.local`.
- Les routes `/opoku`, `/kwaku`, `/agents`, `/comptable` sont protégées par `middleware.ts`.
- Rate limiting sur les pages de login : 10 tentatives / 15 minutes.

### 3.5 Routes admin (noms non standards — intentionnels)
| Portail | Route | Rôle |
|---------|-------|------|
| SuperAdmin | `/opoku` | `superadmin` |
| Agent Validateur | `/kwaku` | `agent_validator` |
| Agent Immobilier | `/agents` | `agent_immobilier` |
| Comptable | `/comptable` | `comptable` |

### 3.6 Emails
- **Resend uniquement** — pas de Nodemailer, pas de SMTP direct.
- Toute la logique email passe par `lib/mailer.ts`.
- Les templates sont brandés Yedidia Estate (rose, drapeau 🇬🇭).

### 3.7 Base de données
- Ne jamais modifier la structure des triggers existants sans validation.
- Les publications validées ne peuvent pas être modifiées par l'Agent Immobilier — seul un Agent Validateur peut le faire via l'ID.
- Toutes les clés étrangères ont des contraintes `ON DELETE CASCADE` ou `SET NULL` selon le cas.

### 3.8 Identité visuelle par portail
Chaque espace admin a son thème visuel distinct pour éviter toute confusion :
- `/agents` → Blanc/Rose (`brand-500`)
- `/kwaku` → Gris foncé/Indigo
- `/opoku` → Noir/Or
- `/comptable` → Teal/Slate

---

## 4. STRUCTURE DES FICHIERS DU PROJET

```
yedidia_estate/
│
├── config/
│   ├── siteconfig.ts          ← fichier central (contacts, formules, routes, SEO, réseaux sociaux...)
│   ├── agency.ts              ← identité visuelle, logo, horaires, éléments Ghana
│   ├── ads.ts                 ← pixels Google Analytics, GTM, Meta Pixel, TikTok, Bing, LinkedIn...
│   └── superadmin.ts          ← lecture credentials SuperAdmin depuis .env uniquement
│
├── app/
│   ├── layout.tsx             ← root layout (font Jakarta, metadata SEO)
│   ├── (public)/
│   │   ├── layout.tsx         ← layout public (Header + Footer + KenteStrip + PopupModal)
│   │   ├── page.tsx           ← page principale — listings + filtres (Server Component)
│   │   ├── property/[id]/
│   │   │   └── page.tsx       ← page détail d'un bien (ID numérique)
│   │   └── legal/
│   │       ├── privacy-policy/page.tsx
│   │       ├── terms-of-sale/page.tsx
│   │       ├── legal-notice/page.tsx
│   │       ├── delivery/page.tsx
│   │       ├── cookie-policy/page.tsx
│   │       ├── complaint/page.tsx
│   │       └── partners/page.tsx   ← "Coming Soon" / vrais partenaires si alimenté
│   │
│   ├── agents/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── publish/page.tsx
│   │   ├── my-listings/page.tsx
│   │   ├── billing/page.tsx
│   │   └── profile/page.tsx
│   │
│   ├── kwaku/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── agents/page.tsx
│   │   ├── listings/page.tsx
│   │   ├── publish/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── legal-partners/page.tsx
│   │   └── subscriptions/page.tsx  ← activation manuelle abonnements (en cours)
│   │
│   ├── opoku/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── formulas/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── popups/page.tsx
│   │
│   ├── comptable/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── payments/page.tsx
│   │   └── revenue/page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       ├── popup/route.ts
│       ├── complaint/route.ts
│       ├── agents/
│       │   ├── listings/route.ts
│       │   ├── listings/[id]/withdraw/route.ts
│       │   ├── upload/route.ts
│       │   ├── billing/paystack/route.ts
│       │   ├── billing/paystack/callback/route.ts
│       │   └── profile/route.ts
│       ├── kwaku/
│       │   ├── agents/route.ts
│       │   ├── listings/route.ts
│       │   ├── analytics/route.ts
│       │   ├── legal-partners/route.ts
│       │   └── subscriptions/route.ts  ← activation manuelle (en cours)
│       ├── opoku/
│       │   ├── users/route.ts
│       │   ├── formulas/route.ts
│       │   └── popups/route.ts
│       ├── comptable/
│       │   └── payments/route.ts
│       └── cron/
│           └── expiry-warning/route.ts   ← à créer (Bloc 9)
│
├── components/
│   ├── public/
│   │   ├── Header.tsx
│   │   ├── FilterBar.tsx
│   │   ├── KenteStrip.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── ContactButtons.tsx
│   │   ├── EmptyState.tsx
│   │   ├── PropertyGallery.tsx
│   │   ├── PropertyDetailCard.tsx
│   │   ├── PopupModal.tsx
│   │   ├── FraudWarning.tsx
│   │   ├── Footer.tsx
│   │   └── LegalPageWrapper.tsx
│   ├── agents/
│   │   ├── AgentSidebar.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── SubscriptionBanner.tsx     ← exporte aussi RecentListings
│   │   ├── PublishForm.tsx
│   │   ├── MediaUploader.tsx
│   │   ├── ListingsTable.tsx
│   │   ├── FormulaCards.tsx
│   │   ├── PaymentHistory.tsx
│   │   └── ProfileForm.tsx
│   ├── kwaku/
│   │   ├── KwakuSidebar.tsx
│   │   ├── AgentManagementTable.tsx
│   │   ├── ListingsModeration.tsx
│   │   ├── AnalyticsChart.tsx
│   │   └── LegalPartnersManager.tsx
│   ├── opoku/
│   │   ├── OpokuSidebar.tsx
│   │   ├── UsersManager.tsx
│   │   ├── FormulaPricingManager.tsx
│   │   └── PopupManager.tsx
│   └── comptable/
│       ├── ComptableSidebar.tsx
│       └── PaymentsLog.tsx
│
├── lib/
│   ├── db.ts                  ← client Supabase (public + admin)
│   ├── auth.ts                ← Argon2 + JWT + sessions + loginUser + requireAuth
│   ├── mailer.ts              ← Resend orchestrator (6 templates email)
│   ├── subscription.ts        ← helpers abonnement (en cours — Bloc 8)
│   └── analytics.ts           ← trackVisit() + IP géolocalisation (à créer — Bloc 10)
│
├── middleware.ts               ← protection routes + rate limiting
├── tailwind.config.js
├── next.config.ts
├── vercel.json                 ← config cron + headers sécurité (à créer)
├── .env.local                  ← jamais commité
└── .gitignore
```

---

## 5. BASE DE DONNÉES — SCHÉMA COMPLET

> La base de données locale s'appelle `yedidia_estate` (PgAdmin4 + PostgreSQL).  
> En production : Supabase PostgreSQL.

### 5.1 Types ENUM

```sql
CREATE TYPE user_role AS ENUM (
  'superadmin',
  'agent_validator',
  'agent_immobilier',
  'comptable'
);

CREATE TYPE user_status AS ENUM ('pending', 'active', 'blocked');

CREATE TYPE listing_type AS ENUM (
  'parcelle',
  'maison_location',
  'airbnb',
  'maison_vente'
);

CREATE TYPE listing_status AS ENUM (
  'pending',
  'active',
  'expired',
  'withdrawn',
  'archived'
);

CREATE TYPE media_type AS ENUM ('photo', 'video');

CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');

CREATE TYPE payment_method AS ENUM ('paystack', 'manual');

CREATE TYPE partner_type AS ENUM ('notaire', 'avocat', 'huissier');
```

### 5.2 Tables

```sql
-- ═══════════════════════════════════════════
-- UTILISATEURS (tous rôles)
-- ═══════════════════════════════════════════
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role             user_role NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  full_name        VARCHAR(255) NOT NULL,
  phone_call       VARCHAR(20),
  phone_whatsapp   VARCHAR(20),
  password_hash    TEXT NOT NULL,
  status           user_status NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  created_by       UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ═══════════════════════════════════════════
-- FORMULES D'ABONNEMENT (configurées par SuperAdmin)
-- ═══════════════════════════════════════════
CREATE TABLE formulas (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(100) NOT NULL,           -- "Formule 1", "Formule 2", etc.
  pub_count          INTEGER NOT NULL,                 -- nombre de publications offertes
  pub_duration_days  INTEGER NOT NULL,                 -- durée de chaque publication en jours
  validity_days      INTEGER NOT NULL,                 -- validité du crédit en jours
  price_ghs          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  is_free_offer      BOOLEAN NOT NULL DEFAULT false,   -- true = offre gratuite initiale
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- ABONNEMENTS DES AGENTS
-- ═══════════════════════════════════════════
CREATE TABLE subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  formula_id       UUID NOT NULL REFERENCES formulas(id),
  purchased_at     TIMESTAMPTZ DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL,               -- purchased_at + validity_days
  pubs_remaining   INTEGER NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  paystack_ref     VARCHAR(255),                       -- null si paiement manuel
  activated_by     UUID REFERENCES users(id),          -- null si Paystack, validateur si manuel
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- PAIEMENTS
-- ═══════════════════════════════════════════
CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  formula_id       UUID NOT NULL REFERENCES formulas(id),
  amount           NUMERIC(10, 2) NOT NULL,
  currency         VARCHAR(5) NOT NULL DEFAULT 'GHS',
  status           payment_status NOT NULL DEFAULT 'pending',
  method           payment_method NOT NULL DEFAULT 'paystack',
  paystack_ref     VARCHAR(255),
  receipt_sent     BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- PUBLICATIONS (listings)
-- ═══════════════════════════════════════════
CREATE TABLE listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id  UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  type             listing_type NOT NULL,
  city             VARCHAR(100) NOT NULL,
  neighborhood     VARCHAR(100),
  price            NUMERIC(12, 2) NOT NULL,
  area_m2          NUMERIC(10, 2),                     -- pour parcelles uniquement
  area_ha          NUMERIC(10, 4),                     -- pour parcelles uniquement
  description      TEXT,
  status           listing_status NOT NULL DEFAULT 'pending',
  published_at     TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  view_count       INTEGER NOT NULL DEFAULT 0,
  whatsapp_clicks  INTEGER NOT NULL DEFAULT 0,
  call_clicks      INTEGER NOT NULL DEFAULT 0,
  validated_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  validated_at     TIMESTAMPTZ,
  validation_note  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- MÉDIAS DES PUBLICATIONS
-- ═══════════════════════════════════════════
CREATE TABLE listing_media (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id       UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  type             media_type NOT NULL,
  storage_url      TEXT NOT NULL,
  display_order    INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,                            -- pour vidéos uniquement
  size_bytes       BIGINT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- POPUPS CONTEXTUELLES
-- ═══════════════════════════════════════════
CREATE TABLE popups (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url        TEXT NOT NULL,
  link_url         TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT false,
  display_from     TIMESTAMPTZ,
  display_until    TIMESTAMPTZ,
  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- PLAINTES DES VISITEURS
-- ═══════════════════════════════════════════
CREATE TABLE complaints (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name     VARCHAR(255) NOT NULL,
  visitor_email    VARCHAR(255) NOT NULL,
  visitor_phone    VARCHAR(20),
  listing_ref      VARCHAR(100),                       -- ID du bien concerné
  message          TEXT NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'open', -- open / in_review / closed
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- PARTENAIRES JURIDIQUES
-- (ajoutés par Agents Validateurs, visibles publiquement sur /legal/partners)
-- ═══════════════════════════════════════════
CREATE TABLE legal_partners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL,
  type             partner_type NOT NULL,
  city             VARCHAR(100),
  address          TEXT,
  phone            VARCHAR(20),
  email            VARCHAR(255),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  added_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- ANALYTICS VISITEURS
-- ═══════════════════════════════════════════
CREATE TABLE analytics_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash          VARCHAR(64),                        -- SHA-256 tronqué, anonymisé
  country          VARCHAR(10),
  region           VARCHAR(100),
  city             VARCHAR(100),
  page_url         TEXT,
  referrer         TEXT,
  user_agent       TEXT,
  visited_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- LOG DES NOTIFICATIONS EMAILS
-- ═══════════════════════════════════════════
CREATE TABLE notifications_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  email_to         VARCHAR(255) NOT NULL,
  type             VARCHAR(50) NOT NULL,               -- 'payment_receipt', 'expiry_warning', etc.
  subject          TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'sent',
  resend_id        VARCHAR(255),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 Triggers et fonctions automatiques

```sql
-- ── Trigger 1 : mise à jour automatique de updated_at ──
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- À appliquer sur toutes les tables avec updated_at :
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- (répéter pour formulas, listings, popups, payments, subscriptions, legal_partners)


-- ── Trigger 2 : archivage automatique des publications quand un agent est bloqué ──
CREATE OR REPLACE FUNCTION archive_listings_on_block()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'blocked' AND OLD.status != 'blocked' THEN
    UPDATE listings
    SET status = 'archived'
    WHERE agent_id = NEW.id AND status IN ('pending', 'active');
  END IF;
  IF NEW.status = 'active' AND OLD.status = 'blocked' THEN
    UPDATE listings
    SET status = 'active'
    WHERE agent_id = NEW.id AND status = 'archived'
      AND expires_at > NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archive_on_block
  AFTER UPDATE OF status ON users
  FOR EACH ROW
  WHEN (NEW.role = 'agent_immobilier')
  EXECUTE FUNCTION archive_listings_on_block();


-- ── Trigger 3 : décrémentation du crédit publications ──
CREATE OR REPLACE FUNCTION decrement_pubs_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status = 'pending' AND NEW.subscription_id IS NOT NULL THEN
    UPDATE subscriptions
    SET pubs_remaining = pubs_remaining - 1
    WHERE id = NEW.subscription_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrement_pubs
  AFTER UPDATE OF status ON listings
  FOR EACH ROW EXECUTE FUNCTION decrement_pubs_remaining();


-- ── Trigger 4 : attribution automatique de l'offre gratuite ──
CREATE OR REPLACE FUNCTION assign_free_offer()
RETURNS TRIGGER AS $$
DECLARE
  free_formula_id UUID;
BEGIN
  IF NEW.role = 'agent_immobilier' AND NEW.status = 'active' THEN
    SELECT id INTO free_formula_id
    FROM formulas
    WHERE is_free_offer = true
    LIMIT 1;

    IF free_formula_id IS NOT NULL THEN
      INSERT INTO subscriptions (agent_id, formula_id, expires_at, pubs_remaining, is_active)
      VALUES (
        NEW.id,
        free_formula_id,
        NOW() + INTERVAL '6 months',
        4,
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_free_offer
  AFTER INSERT OR UPDATE OF status ON users
  FOR EACH ROW EXECUTE FUNCTION assign_free_offer();


-- ── Fonction RPC : incrémentation des vues ──
CREATE OR REPLACE FUNCTION increment_view_count(listing_id UUID)
RETURNS void AS $$
  UPDATE listings SET view_count = view_count + 1 WHERE id = listing_id;
$$ LANGUAGE sql;
```

### 5.4 Données initiales (seed)

```sql
-- Insérer les 6 formules payantes + 1 offre gratuite
INSERT INTO formulas (name, pub_count, pub_duration_days, validity_days, price_ghs, is_free_offer) VALUES
  ('Free Offer',   4,   60,  60,    0.00, true),   -- offre gratuite initiale
  ('Formula 1',   10,   60, 180,    0.00, false),  -- prix fixé par SuperAdmin
  ('Formula 2',   25,   60, 180,    0.00, false),
  ('Formula 3',  100,   60, 365,    0.00, false),
  ('Formula 4',  150,   90, 365,    0.00, false),
  ('Formula 5',  150,  150, 365,    0.00, false),
  ('Formula 6',  150,  180, 365,    0.00, false);
```

---

## 6. ARCHITECTURE DES RÔLES ET ACCÈS

### SuperAdmin (`/opoku`)
- Credentials dans `.env.local` uniquement — **jamais en base de données**
- Créé via `config/superadmin.ts` qui lit `process.env.SUPERADMIN_USERNAME` et `process.env.SUPERADMIN_PASSWORD`
- Capacités : gérer tous les utilisateurs (créer/modifier/bloquer Validateurs et Comptables), fixer les prix des formules, gérer les popups, voir toutes les analytics, accéder à tous les autres portails

### Agent Validateur (`/kwaku`)
- Créé par le SuperAdmin depuis `/opoku/users`
- Capacités : valider/bloquer/débloquer les agents immobiliers, modifier les infos de profil des agents (téléphone appel, téléphone WhatsApp, email, mot de passe), publier des articles (sous son propre profil), activer manuellement des abonnements, gérer les partenaires juridiques, voir les analytics avec filtre de dates

### Agent Immobilier (`/agents`)
- S'inscrit lui-même (registration formulaire sur `/agents/login`)
- Son compte est en `status: 'pending'` jusqu'à activation par un Validateur
- À l'activation : trigger attribue automatiquement l'offre gratuite (4 publications × 60 jours)
- Capacités : publier des biens, voir ses statistiques de clics, retirer ses publications, gérer son profil et abonnements
- **NE PEUT PAS** modifier une publication déjà validée et active

### Comptable (`/comptable`)
- Créé par le SuperAdmin
- Rôle lecture seule sur les finances
- Capacités : voir tous les paiements (réussis, échoués, en attente), voir le chiffre d'affaires, filtrer par date/statut/méthode

---

## 7. LOGIQUE MÉTIER DÉTAILLÉE

### 7.1 Cycle de vie d'une publication

```
Agent publie → status: 'pending'
     ↓
Validateur valide → status: 'active', published_at = NOW(), expires_at = NOW() + pub_duration_days
     ↓
[Publication visible pour les visiteurs]
     ↓
expires_at atteint → status: 'expired' (automatique via cron)
     ↓
OU Agent retire → status: 'withdrawn'
     ↓
OU Agent bloqué → status: 'archived' (réactivé si agent débloqué + not expired)
```

**Règle importante :** Si la formule expire pendant qu'une publication est active, la publication continue jusqu'à sa propre date d'expiration. Le cycle de la publication est indépendant du cycle de la formule une fois lancée.

### 7.2 Règles des formules

| Formule | Publications | Durée/pub | Validité crédit |
|---------|-------------|-----------|-----------------|
| Free Offer | 4 | 60 jours | 60 jours |
| Formule 1 | 10 | 60 jours | 6 mois |
| Formule 2 | 25 | 60 jours | 6 mois |
| Formule 3 | 100 | 60 jours | 12 mois |
| Formule 4 | 150 | 90 jours | 12 mois |
| Formule 5 | 150 | 150 jours | 12 mois |
| Formule 6 | 150 | 180 jours | 12 mois |

- Un agent ne peut avoir qu'**une seule formule active à la fois**
- Impossible de souscrire une nouvelle formule si l'actuelle n'est pas expirée
- Si l'agent n'a pas de formule active, le bouton "Publier" est **désactivé et grisé**

### 7.3 Paiement (Paystack + Manuel)

**Flux Paystack :**
1. Agent clique "Subscribe" sur une formule
2. `POST /api/agents/billing/paystack` → crée `payment` en `pending` + initialise transaction Paystack
3. Redirection vers Paystack checkout
4. Après paiement : Paystack redirige vers `/api/agents/billing/paystack/callback`
5. Vérification via l'API Paystack → si succès : `payment.status = 'success'`, création `subscription`, envoi email reçu
6. Redirection vers `/agents/billing?success=1`

**Flux Manuel :**
1. Agent contacte le support (bouton WhatsApp/email dans la page billing)
2. Après paiement physique, un Agent Validateur active manuellement depuis `/kwaku/subscriptions`
3. API `POST /api/kwaku/subscriptions` → crée la subscription, marque le payment comme `method: 'manual'`
4. Email de confirmation envoyé à l'agent

### 7.4 Analytics visiteurs

- À chaque visite de page publique, `lib/analytics.ts::trackVisit()` est appelé
- L'IP est hashée en SHA-256 (tronqué à 32 chars) avant stockage
- Géolocalisation via `ipinfo.io` API (token dans `.env.local`)
- Les données sont agrégées dans le dashboard Analytics filtrable par période

### 7.5 Avertissements anti-arnaque

- **Parcelles + Maisons à vendre :** Bannière jaune d'avertissement + bouton vers `/legal/partners`
- **Airbnb :** Avertissement rouge spécifique ("ne jamais verser d'avance sans vérification")
- **Maisons à louer :** Aucun avertissement
- Formulaire de plainte accessible depuis `/legal/complaint` → envoie email à `COMPLAINTS_EMAIL`

---

## 8. CE QUI A DÉJÀ ÉTÉ DÉVELOPPÉ (BLOCS VALIDÉS)

> ✅ = fichier créé et validé par le client

### Bloc 1 — Foundations ✅
- `config/siteconfig.ts` — fichier central puissant
- `config/agency.ts` — identité visuelle
- `config/ads.ts` — pixels et tracking
- `config/superadmin.ts` — credentials depuis .env
- `lib/db.ts` — client Supabase (public + admin)
- `lib/schema.sql` — schéma complet exécuté dans PgAdmin4
- `lib/auth.ts` — Argon2 + JWT + sessions + loginUser + requireAuth
- `lib/mailer.ts` — Resend avec 6 templates email
- `middleware.ts` — protection routes + rate limiting

### Bloc 2 — Pages publiques ✅
- `app/layout.tsx` — root layout
- `app/(public)/layout.tsx` — layout public
- `components/public/Header.tsx` — sticky, logo, WhatsApp, Appel
- `components/public/FilterBar.tsx` — Ville/Type/Budget, URL search params
- `components/public/KenteStrip.tsx` — bande décorative Ghana
- `app/(public)/page.tsx` — Server Component, requête DB, filtres, pagination
- `components/public/PropertyCard.tsx` — card complète
- `components/public/PropertyGrid.tsx` — grille responsive 1→2→3→4 colonnes
- `components/public/ContactButtons.tsx` — WhatsApp + Appel
- `components/public/EmptyState.tsx` — état vide
- `app/(public)/property/[id]/page.tsx` — page détail
- `components/public/PropertyGallery.tsx` — slider photos + lightbox + vidéo
- `components/public/PropertyDetailCard.tsx` — specs + notices légales auto
- `app/api/popup/route.ts` — API popup actif
- `components/public/PopupModal.tsx` — popup sessionStorage
- `components/public/FraudWarning.tsx` — bannière dismissable
- `app/(public)/legal/complaint/page.tsx` — formulaire plainte
- `components/public/Footer.tsx` — 4 colonnes, icônes sociales SVG
- `app/(public)/legal/partners/page.tsx` — Coming Soon / vrais partenaires

### Bloc 3 — Pages légales ✅
- `app/api/complaint/route.ts` — POST validation + DB + email
- `components/public/LegalPageWrapper.tsx` — wrapper partagé
- `app/(public)/legal/privacy-policy/page.tsx`
- `app/(public)/legal/terms-of-sale/page.tsx`
- `app/(public)/legal/legal-notice/page.tsx`
- `app/(public)/legal/delivery/page.tsx`
- `app/(public)/legal/cookie-policy/page.tsx`

### Bloc 4 — Agent Immobilier `/agents` ✅
- `app/agents/login/page.tsx`
- `app/agents/layout.tsx`
- `components/agents/AgentSidebar.tsx`
- `app/agents/dashboard/page.tsx`
- `components/agents/DashboardStats.tsx`
- `components/agents/SubscriptionBanner.tsx` (exporte aussi `RecentListings`)
- `app/agents/publish/page.tsx`
- `components/agents/PublishForm.tsx`
- `components/agents/MediaUploader.tsx`
- `app/api/agents/listings/route.ts`
- `app/api/agents/upload/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/agents/my-listings/page.tsx`
- `components/agents/ListingsTable.tsx`
- `app/api/agents/listings/[id]/withdraw/route.ts`
- `app/agents/billing/page.tsx`
- `components/agents/FormulaCards.tsx`
- `components/agents/PaymentHistory.tsx`
- `app/api/agents/billing/paystack/route.ts`
- `app/api/agents/billing/paystack/callback/route.ts`
- `app/agents/profile/page.tsx`
- `components/agents/ProfileForm.tsx`
- `app/api/agents/profile/route.ts`

### Bloc 5 — Agent Validateur `/kwaku` ✅
- `app/kwaku/login/page.tsx`
- `app/kwaku/layout.tsx`
- `components/kwaku/KwakuSidebar.tsx`
- `app/kwaku/agents/page.tsx`
- `components/kwaku/AgentManagementTable.tsx`
- `app/api/kwaku/agents/route.ts`
- `app/kwaku/listings/page.tsx`
- `components/kwaku/ListingsModeration.tsx`
- `app/api/kwaku/listings/route.ts`
- `app/kwaku/dashboard/page.tsx`
- `app/kwaku/publish/page.tsx`
- `app/kwaku/analytics/page.tsx`
- `components/kwaku/AnalyticsChart.tsx`
- `app/api/kwaku/analytics/route.ts`
- `app/kwaku/legal-partners/page.tsx`
- `components/kwaku/LegalPartnersManager.tsx`
- `app/api/kwaku/legal-partners/route.ts`
- `app/kwaku/subscriptions/page.tsx` — **EN COURS** (commencé mais à vérifier/compléter)
- `app/api/kwaku/subscriptions/route.ts` — **EN COURS** (à vérifier/compléter)

### Bloc 6 — SuperAdmin `/opoku` ✅
- `app/opoku/login/page.tsx`
- `app/opoku/layout.tsx`
- `components/opoku/OpokuSidebar.tsx`
- `app/opoku/users/page.tsx`
- `components/opoku/UsersManager.tsx`
- `app/api/opoku/users/route.ts`
- `app/opoku/formulas/page.tsx`
- `components/opoku/FormulaPricingManager.tsx`
- `app/api/opoku/formulas/route.ts`
- `app/opoku/analytics/page.tsx`
- `app/opoku/dashboard/page.tsx`
- `app/opoku/popups/page.tsx`
- `components/opoku/PopupManager.tsx`
- `app/api/opoku/popups/route.ts`

### Bloc 7 — Comptable `/comptable` ✅
- `app/comptable/login/page.tsx`
- `app/comptable/layout.tsx`
- `components/comptable/ComptableSidebar.tsx`
- `app/comptable/dashboard/page.tsx`
- `app/api/comptable/payments/route.ts`
- `app/comptable/payments/page.tsx`
- `components/comptable/PaymentsLog.tsx`
- `app/comptable/revenue/page.tsx`

---

## 9. CE QUI RESTE À FAIRE (BLOCS EN COURS / À FAIRE)

### Bloc 8 — Subscription Engine (Partiel)
**Statut :** `lib/subscription.ts` commencé mais à vérifier et compléter.

**Fichiers à créer/vérifier :**

#### `lib/subscription.ts` — Helpers abonnement
Ce fichier doit exposer les fonctions suivantes :
```ts
// Vérifie si un agent a un abonnement actif avec des crédits
getActiveSubscription(agentId: string): Promise<Subscription | null>

// Vérifie si l'agent a déjà utilisé son offre gratuite
hasUsedFreeOffer(agentId: string): Promise<boolean>

// Retourne le nombre de crédits restants
getRemainingPublications(agentId: string): Promise<number>

// Vérifie si l'agent peut publier (abonnement actif + crédits > 0)
canPublish(agentId: string): Promise<boolean>

// Expire automatiquement les subscriptions dépassées
expireOldSubscriptions(): Promise<void>
```

**Logique :** La subscription est active si `is_active = true` ET `expires_at > NOW()` ET `pubs_remaining > 0`.

#### `app/kwaku/subscriptions/page.tsx` + `app/api/kwaku/subscriptions/route.ts`
Page d'activation manuelle des abonnements pour les paiements cash.  
**Interface :**
- Rechercher un agent par email ou nom
- Sélectionner une formule à activer
- Confirmer le montant reçu
- Activer → crée la `subscription` + `payment (method: 'manual', status: 'success')` + envoie email à l'agent

---

### Bloc 9 — Notifications & Cron Jobs (À CRÉER)

#### `app/api/cron/expiry-warning/route.ts`
Route appelée par Vercel Cron chaque jour à 08h00 UTC.  
**Logique :**
1. Requête DB : `SELECT * FROM listings WHERE status = 'active' AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
2. Pour chaque listing trouvé : appeler `sendExpiryWarning(agentEmail, listingTitle, expiresAt)` depuis `lib/mailer.ts`
3. Logger dans `notifications_log`
4. Retourner `{ processed: N }` en JSON

```ts
// app/api/cron/expiry-warning/route.ts
// Protection : vérifier le header Authorization: Bearer CRON_SECRET
const authHeader = req.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

#### `vercel.json` — Configuration Vercel Cron + Headers de sécurité
```json
{
  "crons": [
    {
      "path": "/api/cron/expiry-warning",
      "schedule": "0 8 * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

### Bloc 10 — Analytics & Visitor Tracking (À CRÉER)

#### `lib/analytics.ts`
```ts
// lib/analytics.ts
// Fonction à appeler dans middleware.ts pour chaque visite de page publique

export async function trackVisit(req: Request): Promise<void>
// - Extraire l'IP depuis x-forwarded-for
// - Hasher l'IP en SHA-256 (32 premiers chars)
// - Appeler ipinfo.io API pour géolocalisation
// - Insérer dans analytics_events
// - Ne jamais throw (les erreurs analytics ne doivent pas bloquer la navigation)
```

#### Mise à jour de `middleware.ts`
Ajouter l'appel à `trackVisit` pour les routes publiques uniquement :
- `GET /` → tracker
- `GET /property/*` → tracker
- Exclure les routes API, admin, et les assets Next.js (`_next/`, `favicon.ico`, etc.)

---

### Étapes finales de mise en production

#### Fichier `.env.production` (à créer)
Remplacer les valeurs de test par les valeurs production :
```env
# SUPABASE PRODUCTION
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[prod-service-role-key]

# DATABASE PRODUCTION
DATABASE_URL=postgresql://[prod-url]

# PAYSTACK LIVE (remplacer sk_test_ par sk_live_)
PAYSTACK_SECRET_KEY=sk_live_xxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx

# RESEND PRODUCTION (domaine vérifié)
RESEND_API_KEY=re_live_xxxx
RESEND_FROM=Yedidia Estate <noreply@yedidia-estate.com>

# CRON SECRET
CRON_SECRET=un_secret_aleatoire_long_pour_les_crons

# APP URL
NEXT_PUBLIC_APP_URL=https://www.yedidia-estate.com
NODE_ENV=production
```

---

## 10. FICHIERS DE CONFIGURATION CENTRAUX

### `config/siteconfig.ts` — Structure attendue
Ce fichier centralise **toutes** les informations de l'agence :
```ts
export const siteConfig = {
  name: "Yedidia Estate",
  tagline: "...",
  url: process.env.NEXT_PUBLIC_APP_URL,
  contact: {
    phone1: "...",
    phone2: "...",
    whatsapp: "...",
    emailContact: "contact@yedidia-estate.com",
    emailComplaints: "complaints@yedidia-estate.com",
    emailPartnership: "partnership@yedidia-estate.com",
    telegram: "...",
    address: "...",  // siège au Ghana
  },
  social: {
    facebook: "...",
    instagram: "...",
    tiktok: "...",
    linkedin: "...",
    youtube: "...",
    twitter: "...",
  },
  legal: {
    registrationNumber: "...",
    vatNumber: "...",
  },
  formulas: [/* données des formules pour affichage dynamique */],
  routes: {
    superadmin: "/opoku",
    validator: "/kwaku",
    agent: "/agents",
    accountant: "/comptable",
  }
}
```

---

## 11. VARIABLES D'ENVIRONNEMENT (.env.local)

```env
# SUPERADMIN
SUPERADMIN_USERNAME=opoku_admin
SUPERADMIN_PASSWORD=ChangeMeStrong2025!

# BASE DE DONNÉES LOCALE
DATABASE_URL=postgresql://postgres:[password]@localhost:5432/yedidia_estate

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx

# AUTH
JWT_SECRET=yedidia_jwt_secret_tres_long_et_aleatoire_2025

# RESEND
RESEND_API_KEY=re_xxxx
RESEND_FROM=Yedidia Estate <noreply@yedidia-estate.com>

# PAYSTACK
PAYSTACK_SECRET_KEY=sk_test_xxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxx

# IPINFO (géolocalisation visiteurs)
IPINFO_TOKEN=votre_token

# CRON
CRON_SECRET=secret_pour_vercel_cron

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 12. CONTRAINTES MÉDIAS

| Type | Format | Taille max | Durée max | Quantité max |
|------|--------|-----------|-----------|-------------|
| Photo | JPG, PNG, WebP | **5 MB** | — | **6 par bien** |
| Vidéo | MP4, MOV, WebM | **10 MB** | **60 secondes** | **1 par parcelle** |

**Règles métier :**
- Les parcelles exigent **uniquement une vidéo** — zéro photo autorisée
- Les maisons (location, vente) et Airbnb acceptent **uniquement des photos** — zéro vidéo
- Validation côté client : API HTML5 `<video>` pour durée + `file.size` pour taille
- Validation côté serveur dans `app/api/agents/upload/route.ts` : re-vérification obligatoire

**Supabase Storage :**
- Bucket : `yedidia-media` (public)
- Chemin fichiers : `listings/{listing_id}/{filename}`

---

## 13. SYSTÈME DE PAIEMENT

### Paystack
- Devise : **GHS (Cedi ghanéen)**
- Mode test : clés `sk_test_` / `pk_test_`
- Mode production : clés `sk_live_` / `pk_live_`
- Webhook de callback : `GET /api/agents/billing/paystack/callback`
- Vérification obligatoire via l'API Paystack avant d'activer la subscription

### Paiement Manuel
- L'agent contacte le support
- Un Agent Validateur active manuellement depuis `/kwaku/subscriptions`
- `payment.method = 'manual'`, `payment.status = 'success'`
- Email de confirmation automatique via Resend

### Reçu de paiement
- Envoyé automatiquement à l'email de l'agent après tout paiement validé (Paystack ou manuel)
- Template : `sendPaymentReceipt()` dans `lib/mailer.ts`

---

## 14. EMAILS TRANSACTIONNELS

Tous les emails passent par `lib/mailer.ts` avec Resend. Les 6 fonctions disponibles :

| Fonction | Déclencheur |
|---------|------------|
| `sendPaymentReceipt()` | Paiement validé (Paystack callback ou activation manuelle) |
| `sendExpiryWarning()` | Cron J-7 avant expiration d'une publication |
| `sendAccountBlocked()` | Agent Validateur bloque un profil |
| `sendAccountActivated()` | Agent Validateur active/débloque un profil |
| `sendComplaintNotification()` | Formulaire de plainte soumis sur `/legal/complaint` |
| `sendManualPaymentRequest()` | Agent demande une activation manuelle |

**Configuration Resend :**
- `RESEND_API_KEY` dans `.env.local`
- Domaine à vérifier sur resend.com en production
- `RESEND_FROM` format : `Yedidia Estate <noreply@yedidia-estate.com>`

---

## 15. SÉCURITÉ

### Auth
- **Argon2id** pour tous les mots de passe — paramètres : `memoryCost: 65536, timeCost: 3, parallelism: 4`
- **JWT HS256** avec `JWT_SECRET` — expiration : 24h
- Cookie HttpOnly, SameSite: strict, Secure en production

### Middleware (`middleware.ts`)
- Protège `/opoku`, `/kwaku`, `/agents`, `/comptable` et tous leurs sous-chemins
- Redirige vers la page login du portail correspondant si session absente
- Rate limiting login : **10 tentatives / 15 minutes** par IP (stocké en mémoire, à migrer vers Redis en prod si besoin)
- Injection des headers de session pour les Server Components

### Routes Admin Obfusquées
- `/opoku` au lieu de `/admin` — SuperAdmin
- `/kwaku` au lieu de `/validators` — Agent Validateur
- Les pages de login n'affichent aucun message indiquant le type d'utilisateur attendu

### Headers de sécurité (dans `vercel.json`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 16. DÉPLOIEMENT PRÉVU

### Infrastructure
- **Frontend + API Routes :** Vercel
- **Base de données + Storage :** Supabase

### Variables à changer pour la production
1. Dans `.env.production` : remplacer toutes les clés `_test_` par `_live_` (Paystack)
2. Vérifier le domaine email sur Resend
3. Configurer le domaine custom sur Vercel
4. Configurer les variables d'environnement dans le dashboard Vercel
5. Exécuter `lib/schema.sql` sur la base Supabase de production
6. Créer le bucket `yedidia-media` (public) dans Supabase Storage production
7. Configurer le Vercel Cron avec le `CRON_SECRET`

### Vercel Cron Jobs
Le fichier `vercel.json` doit inclure le cron J-7 :
```json
{
  "crons": [{
    "path": "/api/cron/expiry-warning",
    "schedule": "0 8 * * *"
  }]
}
```
La route cron vérifie le header `Authorization: Bearer CRON_SECRET`.

---

## RÉSUMÉ — TÂCHES RESTANTES POUR CLAUDE CODE

Claude Code doit **d'abord lire les fichiers existants** avant de créer quoi que ce soit, pour s'assurer de la cohérence avec ce qui a déjà été fait.

### Priorité 1 — Vérifier et compléter les fichiers en cours
- [ ] Vérifier `app/kwaku/subscriptions/page.tsx` (commencé mais potentiellement incomplet)
- [ ] Vérifier `app/api/kwaku/subscriptions/route.ts`

### Priorité 2 — Créer les fichiers manquants
- [ ] `lib/subscription.ts` — helpers abonnement (voir section 9, Bloc 8)
- [ ] `lib/analytics.ts` — trackVisit() + IP géolocalisation (voir section 9, Bloc 10)
- [ ] `app/api/cron/expiry-warning/route.ts` — Vercel Cron J-7 (voir section 9, Bloc 9)
- [ ] `vercel.json` — config cron + headers sécurité (voir section 9, Bloc 9)
- [ ] Mise à jour de `middleware.ts` pour intégrer `trackVisit()` sur les routes publiques

### Priorité 3 — Tests et cohérence
- [ ] Vérifier que tous les imports entre fichiers sont cohérents
- [ ] Vérifier que `components/agents/SubscriptionBanner.tsx` exporte bien `RecentListings`
- [ ] Vérifier que `app/(public)/legal/partners/page.tsx` gère les deux cas : "Coming Soon" si aucun partenaire en DB, liste réelle sinon

---

*Document généré automatiquement depuis l'historique complet du projet Yedidia Estate.*  
*Toute modification de la structure du projet doit être reflétée dans ce document.*
