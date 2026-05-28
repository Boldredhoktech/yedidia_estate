-- lib/schema.sql
-- ═══════════════════════════════════════════════════════════════
-- YEDIDIA ESTATE — Full Database Schema
-- Run this file in PgAdmin4 Query Tool on database: yedidia_estate
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────
-- EXTENSIONS
-- ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────
-- ENUMS
-- ───────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'superadmin',
  'agent_validator',
  'agent_immobilier',
  'comptable'
);

CREATE TYPE user_status AS ENUM (
  'pending',    -- awaiting validation by agent_validator
  'active',
  'blocked'
);

CREATE TYPE property_type AS ENUM (
  'parcelle',
  'maison_vente',
  'maison_location',
  'airbnb'
);

CREATE TYPE listing_status AS ENUM (
  'draft',       -- saved but not submitted
  'pending',     -- submitted, awaiting validation
  'active',      -- validated and visible on site
  'expired',     -- passed expiry date
  'withdrawn',   -- manually removed by agent
  'archived'     -- auto-archived (agent blocked, etc.)
);

CREATE TYPE media_type AS ENUM (
  'photo',
  'video'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'success',
  'failed',
  'refunded'
);

CREATE TYPE payment_method AS ENUM (
  'paystack',
  'manual'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'expired',
  'suspended'
);

CREATE TYPE complaint_status AS ENUM (
  'received',
  'under_review',
  'resolved',
  'closed'
);

CREATE TYPE legal_partner_type AS ENUM (
  'notaire',
  'avocat',
  'huissier'
);

-- ───────────────────────────────────────────
-- TABLE: users
-- ───────────────────────────────────────────
CREATE TABLE users (
                       id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
                       role              user_role     NOT NULL,
                       status            user_status   NOT NULL DEFAULT 'pending',
                       full_name         VARCHAR(150)  NOT NULL,
                       email             VARCHAR(255)  NOT NULL UNIQUE,
                       password_hash     TEXT          NOT NULL,
                       phone_call        VARCHAR(30),                      -- number for call button
                       phone_whatsapp    VARCHAR(30),                      -- number for whatsapp button
                       avatar_url        TEXT,
                       created_by        UUID          REFERENCES users(id) ON DELETE SET NULL,
                       blocked_at        TIMESTAMPTZ,
                       blocked_by        UUID          REFERENCES users(id) ON DELETE SET NULL,
                       last_login_at     TIMESTAMPTZ,
                       created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
                       updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_status  ON users(status);
CREATE INDEX idx_users_email   ON users(email);

-- ───────────────────────────────────────────
-- TABLE: formulas
-- Prices and structure managed by SuperAdmin
-- ───────────────────────────────────────────
CREATE TABLE formulas (
                          id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
                          formula_key         VARCHAR(10)   NOT NULL UNIQUE,  -- F1, F2 ... F6
                          name                VARCHAR(100)  NOT NULL,
                          pub_count           INTEGER       NOT NULL,          -- number of publications allowed
                          pub_duration_days   INTEGER       NOT NULL,          -- days each publication stays live
                          validity_days       INTEGER       NOT NULL,          -- days the subscription is valid
                          price_ghs           NUMERIC(10,2) NOT NULL DEFAULT 0,
                          is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
                          updated_by          UUID          REFERENCES users(id) ON DELETE SET NULL,
                          created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
                          updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Seed default formulas (prices set to 0 — SuperAdmin updates them)
INSERT INTO formulas (formula_key, name, pub_count, pub_duration_days, validity_days, price_ghs) VALUES
                                                                                                     ('FREE', 'Free Offer',  4,   60,  60,   0.00),
                                                                                                     ('F1',   'Starter',     10,  60,  180,  0.00),
                                                                                                     ('F2',   'Business',    25,  60,  180,  0.00),
                                                                                                     ('F3',   'Pro',         100, 60,  365,  0.00),
                                                                                                     ('F4',   'Premium',     150, 90,  365,  0.00),
                                                                                                     ('F5',   'Elite',       150, 150, 365,  0.00),
                                                                                                     ('F6',   'Diamond',     150, 180, 365,  0.00);

-- ───────────────────────────────────────────
-- TABLE: subscriptions
-- One active subscription per agent at a time
-- ───────────────────────────────────────────
CREATE TABLE subscriptions (
                               id                UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
                               agent_id          UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               formula_id        UUID                NOT NULL REFERENCES formulas(id),
                               status            subscription_status NOT NULL DEFAULT 'active',
                               pubs_remaining    INTEGER             NOT NULL,
                               purchased_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
                               expires_at        TIMESTAMPTZ         NOT NULL,
                               activated_by      UUID                REFERENCES users(id) ON DELETE SET NULL, -- for manual payments
                               created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
                               updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_agent   ON subscriptions(agent_id);
CREATE INDEX idx_subscriptions_status  ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);

-- ───────────────────────────────────────────
-- TABLE: payments
-- ───────────────────────────────────────────
CREATE TABLE payments (
                          id                UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
                          agent_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          formula_id        UUID            NOT NULL REFERENCES formulas(id),
                          subscription_id   UUID            REFERENCES subscriptions(id) ON DELETE SET NULL,
                          amount            NUMERIC(10,2)   NOT NULL,
                          currency          VARCHAR(5)      NOT NULL DEFAULT 'GHS',
                          status            payment_status  NOT NULL DEFAULT 'pending',
                          method            payment_method  NOT NULL DEFAULT 'paystack',
                          paystack_ref      VARCHAR(255),                              -- Paystack transaction reference
                          paystack_data     JSONB,                                     -- full Paystack webhook payload
                          receipt_sent      BOOLEAN         NOT NULL DEFAULT FALSE,
                          validated_by      UUID            REFERENCES users(id) ON DELETE SET NULL, -- for manual payments
                          validated_at      TIMESTAMPTZ,
                          notes             TEXT,                                      -- manual payment notes
                          created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                          updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_agent   ON payments(agent_id);
CREATE INDEX idx_payments_status  ON payments(status);
CREATE INDEX idx_payments_method  ON payments(method);
CREATE INDEX idx_payments_created ON payments(created_at);

-- ───────────────────────────────────────────
-- TABLE: listings
-- ───────────────────────────────────────────
CREATE TABLE listings (
                          id                UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
                          agent_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          subscription_id   UUID            REFERENCES subscriptions(id) ON DELETE SET NULL,
                          type              property_type   NOT NULL,
                          status            listing_status  NOT NULL DEFAULT 'pending',
                          title             VARCHAR(200)    NOT NULL,
                          description       TEXT,
                          city              VARCHAR(100)    NOT NULL,
                          neighborhood      VARCHAR(100)    NOT NULL,
                          price             NUMERIC(14,2)   NOT NULL,
                          price_label       VARCHAR(50),                  -- e.g. "/ month" for rentals
                          area_m2           NUMERIC(10,2),                -- for parcelles
                          area_hectares     NUMERIC(10,4),                -- for parcelles
                          bedrooms          INTEGER,
                          bathrooms         INTEGER,
                          published_at      TIMESTAMPTZ,
                          expires_at        TIMESTAMPTZ,
                          validated_by      UUID            REFERENCES users(id) ON DELETE SET NULL,
                          validated_at      TIMESTAMPTZ,
                          validation_note   TEXT,
                          withdrawn_at      TIMESTAMPTZ,
                          archived_at       TIMESTAMPTZ,
                          view_count        INTEGER         NOT NULL DEFAULT 0,
                          whatsapp_clicks   INTEGER         NOT NULL DEFAULT 0,
                          call_clicks       INTEGER         NOT NULL DEFAULT 0,
                          created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                          updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_agent    ON listings(agent_id);
CREATE INDEX idx_listings_status   ON listings(status);
CREATE INDEX idx_listings_type     ON listings(type);
CREATE INDEX idx_listings_city     ON listings(city);
CREATE INDEX idx_listings_expires  ON listings(expires_at);
CREATE INDEX idx_listings_created  ON listings(created_at DESC);

-- ───────────────────────────────────────────
-- TABLE: listing_media
-- ───────────────────────────────────────────
CREATE TABLE listing_media (
                               id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
                               listing_id        UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
                               type              media_type  NOT NULL,
                               storage_url       TEXT        NOT NULL,
                               size_bytes        BIGINT,
                               duration_seconds  INTEGER,                -- for videos only
                               display_order     INTEGER     NOT NULL DEFAULT 0,
                               created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_listing ON listing_media(listing_id);

-- ───────────────────────────────────────────
-- TABLE: popups
-- Managed by SuperAdmin and Agent Validators
-- ───────────────────────────────────────────
CREATE TABLE popups (
                        id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
                        title           VARCHAR(150),
                        image_url       TEXT        NOT NULL,
                        link_url        TEXT,
                        is_active       BOOLEAN     NOT NULL DEFAULT FALSE,
                        display_from    TIMESTAMPTZ,
                        display_until   TIMESTAMPTZ,
                        created_by      UUID        REFERENCES users(id) ON DELETE SET NULL,
                        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_popups_active ON popups(is_active);

-- ───────────────────────────────────────────
-- TABLE: complaints
-- Submitted by visitors via public form
-- ───────────────────────────────────────────
CREATE TABLE complaints (
                            id                UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
                            visitor_name      VARCHAR(150)      NOT NULL,
                            visitor_email     VARCHAR(255)      NOT NULL,
                            visitor_phone     VARCHAR(30),
                            listing_ref       VARCHAR(100),                -- listing ID or title mentioned
                            message           TEXT              NOT NULL,
                            status            complaint_status  NOT NULL DEFAULT 'received',
                            handled_by        UUID              REFERENCES users(id) ON DELETE SET NULL,
                            handler_notes     TEXT,
                            created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
                            updated_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_status  ON complaints(status);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);

-- ───────────────────────────────────────────
-- TABLE: legal_partners
-- Added by Agent Validators
-- ───────────────────────────────────────────
CREATE TABLE legal_partners (
                                id          UUID                 PRIMARY KEY DEFAULT uuid_generate_v4(),
                                name        VARCHAR(200)         NOT NULL,
                                type        legal_partner_type   NOT NULL,
                                city        VARCHAR(100)         NOT NULL,
                                phone       VARCHAR(30),
                                email       VARCHAR(255),
                                address     TEXT,
                                notes       TEXT,
                                is_active   BOOLEAN              NOT NULL DEFAULT TRUE,
                                added_by    UUID                 REFERENCES users(id) ON DELETE SET NULL,
                                created_at  TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
                                updated_at  TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_legal_partners_type ON legal_partners(type);
CREATE INDEX idx_legal_partners_city ON legal_partners(city);

-- ───────────────────────────────────────────
-- TABLE: analytics_events
-- One row per page visit
-- ───────────────────────────────────────────
CREATE TABLE analytics_events (
                                  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
                                  ip_hash     VARCHAR(64),              -- SHA256 of IP (privacy-safe)
                                  country     VARCHAR(100),
                                  region      VARCHAR(100),
                                  city        VARCHAR(100),
                                  page_url    TEXT,
                                  referrer    TEXT,
                                  user_agent  TEXT,
                                  visited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_visited  ON analytics_events(visited_at DESC);
CREATE INDEX idx_analytics_country  ON analytics_events(country);
CREATE INDEX idx_analytics_city     ON analytics_events(city);

-- ───────────────────────────────────────────
-- TABLE: notifications_log
-- Track all automated emails sent
-- ───────────────────────────────────────────
CREATE TABLE notifications_log (
                                   id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
                                   recipient_id  UUID        REFERENCES users(id) ON DELETE SET NULL,
                                   email_to      VARCHAR(255) NOT NULL,
                                   subject       VARCHAR(255) NOT NULL,
                                   type          VARCHAR(50)  NOT NULL,   -- 'receipt' | 'expiry_warning' | 'blocked' | 'activated' | 'complaint'
                                   status        VARCHAR(20)  NOT NULL DEFAULT 'sent',
                                   resend_id     TEXT,                    -- Resend message ID for tracking
                                   error_message TEXT,
                                   sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_recipient ON notifications_log(recipient_id);
CREATE INDEX idx_notif_type      ON notifications_log(type);
CREATE INDEX idx_notif_sent      ON notifications_log(sent_at DESC);

-- ───────────────────────────────────────────
-- FUNCTION: auto-update updated_at timestamp
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_formulas_updated_at
    BEFORE UPDATE ON formulas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_popups_updated_at
    BEFORE UPDATE ON popups
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_legal_partners_updated_at
    BEFORE UPDATE ON legal_partners
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ───────────────────────────────────────────
-- FUNCTION: auto-archive listings when agent is blocked
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION archive_listings_on_block()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'blocked' AND OLD.status != 'blocked' THEN
UPDATE listings
SET
    status      = 'archived',
    archived_at = NOW()
WHERE
    agent_id = NEW.id
  AND status IN ('active', 'pending', 'draft');
END IF;

  IF NEW.status = 'active' AND OLD.status = 'blocked' THEN
    -- Reactivate only listings that were archived due to the block
    -- and have not yet passed their expiry date
UPDATE listings
SET
    status      = 'active',
    archived_at = NULL
WHERE
    agent_id   = NEW.id
  AND status = 'archived'
  AND (expires_at IS NULL OR expires_at > NOW());
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archive_on_block
    AFTER UPDATE OF status ON users
    FOR EACH ROW
    WHEN (NEW.role = 'agent_immobilier')
    EXECUTE FUNCTION archive_listings_on_block();

-- ───────────────────────────────────────────
-- FUNCTION: decrement pubs_remaining on publish
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION decrement_pubs_remaining()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrement when listing moves from draft/pending → active
  IF NEW.status = 'active' AND OLD.status IN ('draft', 'pending') THEN
UPDATE subscriptions
SET pubs_remaining = pubs_remaining - 1
WHERE id = NEW.subscription_id
  AND pubs_remaining > 0;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrement_pubs
    AFTER UPDATE OF status ON listings
    FOR EACH ROW EXECUTE FUNCTION decrement_pubs_remaining();

-- ───────────────────────────────────────────
-- FREE OFFER: auto-assign when agent is activated
-- Fires on INSERT and on UPDATE OF status to cover the
-- activation flow (agent created pending → validator activates)
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION assign_free_offer()
RETURNS TRIGGER AS $$
DECLARE
  free_formula_id UUID;
BEGIN
  -- Guard: only for agents being set to active
  IF NEW.role = 'agent_immobilier' AND NEW.status = 'active' THEN
    -- Guard: only assign once (no duplicate free offers)
    IF NOT EXISTS (
      SELECT 1 FROM subscriptions WHERE agent_id = NEW.id
    ) THEN
      SELECT id INTO free_formula_id
      FROM formulas
      WHERE formula_key = 'FREE'
      LIMIT 1;

      IF free_formula_id IS NOT NULL THEN
        INSERT INTO subscriptions (
          agent_id,
          formula_id,
          status,
          pubs_remaining,
          purchased_at,
          expires_at
        ) VALUES (
          NEW.id,
          free_formula_id,
          'active',
          4,
          NOW(),
          NOW() + INTERVAL '60 days'
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_free_offer
    AFTER INSERT OR UPDATE OF status ON users
    FOR EACH ROW
    WHEN (NEW.role = 'agent_immobilier' AND NEW.status = 'active')
    EXECUTE FUNCTION assign_free_offer();

-- ═══════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ═══════════════════════════════════════════════════════════════