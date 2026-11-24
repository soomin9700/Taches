

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projet (
    id              TEXT PRIMARY KEY, 
    owner_uid       TEXT NOT NULL,   
    nom             TEXT NOT NULL,
    description     TEXT,
    couleur         TEXT NOT NULL DEFAULT '#64748b',
    statut          TEXT NOT NULL DEFAULT 'ACTIF'
                    CHECK (statut IN ('ACTIF', 'TERMINE', 'ARCHIVE')),
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    date_modification TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),


    sync_status     TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (sync_status IN ('PENDING', 'SYNCED', 'ERROR')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    deleted_at      TEXT
);

CREATE INDEX IF NOT EXISTS idx_projet_owner
    ON projet(owner_uid);

CREATE INDEX IF NOT EXISTS idx_projet_sync
    ON projet(sync_status, updated_at);


CREATE TABLE IF NOT EXISTS tache (
    id                  TEXT PRIMARY KEY,
    projet_id           TEXT NOT NULL,
    parent_id           TEXT,

    titre               TEXT NOT NULL,
    description         TEXT,

    date_debut          TEXT, 
    date_fin            TEXT, 

    duree_estimee_min   INTEGER NOT NULL DEFAULT 0
                        CHECK (duree_estimee_min >= 0),

    
    avancement          REAL NOT NULL DEFAULT 0
                        CHECK (avancement >= 0 AND avancement <= 100),

    statut              TEXT NOT NULL DEFAULT 'A_FAIRE'
                        CHECK (statut IN ('A_FAIRE', 'EN_COURS', 'TERMINE', 'ANNULE')),

    ordre_affichage    INTEGER NOT NULL DEFAULT 0,

    date_creation       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    date_modification  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    sync_status         TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (sync_status IN ('PENDING', 'SYNCED', 'ERROR')),
    updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    deleted_at          TEXT,

    FOREIGN KEY (projet_id) REFERENCES projet(id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    FOREIGN KEY (parent_id) REFERENCES tache(id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CHECK (parent_id IS NULL OR parent_id <> id),
    CHECK (date_debut IS NULL OR date_fin IS NULL OR date_fin >= date_debut)
);

CREATE INDEX IF NOT EXISTS idx_tache_projet
    ON tache(projet_id);

CREATE INDEX IF NOT EXISTS idx_tache_parent
    ON tache(parent_id);

CREATE INDEX IF NOT EXISTS idx_tache_dates
    ON tache(date_debut, date_fin);

CREATE INDEX IF NOT EXISTS idx_tache_sync
    ON tache(sync_status, updated_at);



CREATE TABLE IF NOT EXISTS session_travail (
    id                  TEXT PRIMARY KEY,
    tache_id            TEXT NOT NULL,

    date_debut          TEXT NOT NULL,
    date_fin            TEXT,

    duree_secondes      INTEGER NOT NULL DEFAULT 0
                        CHECK (duree_secondes >= 0),

    commentaire         TEXT,

    statut              TEXT NOT NULL DEFAULT 'EN_COURS'
                        CHECK (statut IN ('EN_COURS', 'TERMINEE', 'INTERROMPUE')),

    date_creation       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    date_modification  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

   
    sync_status         TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (sync_status IN ('PENDING', 'SYNCED', 'ERROR')),
    updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    deleted_at          TEXT,

    FOREIGN KEY (tache_id) REFERENCES tache(id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

CREATE INDEX IF NOT EXISTS idx_session_tache
    ON session_travail(tache_id);

CREATE INDEX IF NOT EXISTS idx_session_debut
    ON session_travail(date_debut);

CREATE INDEX IF NOT EXISTS idx_session_sync
    ON session_travail(sync_status, updated_at);

-- L'application ne doit autoriser qu'une seule session EN_COURS
-- par utilisateur/appareil si cette regle correspond a son fonctionnement.
-- Cet index garantit au minimum une seule session active par tache.
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_active_par_tache
    ON session_travail(tache_id)
    WHERE statut = 'EN_COURS' AND deleted_at IS NULL;



CREATE TABLE IF NOT EXISTS historique_tache (
    id                  TEXT PRIMARY KEY,
    tache_id            TEXT NOT NULL,

    type_modification   TEXT NOT NULL,
    ancienne_valeur     TEXT,
    nouvelle_valeur     TEXT,
    commentaire         TEXT,

    date_modification   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    
    sync_status         TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (sync_status IN ('PENDING', 'SYNCED', 'ERROR')),
    updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    deleted_at          TEXT,

    FOREIGN KEY (tache_id) REFERENCES tache(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_historique_tache
    ON historique_tache(tache_id, date_modification);

CREATE INDEX IF NOT EXISTS idx_historique_sync
    ON historique_tache(sync_status, updated_at);


CREATE VIEW IF NOT EXISTS v_temps_passe_par_tache AS
SELECT
    t.id AS tache_id,
    COALESCE(SUM(
        CASE
            WHEN s.deleted_at IS NULL THEN s.duree_secondes
            ELSE 0
        END
    ), 0) AS temps_passe_secondes
FROM tache t
LEFT JOIN session_travail s ON s.tache_id = t.id
GROUP BY t.id;



CREATE TRIGGER IF NOT EXISTS trg_projet_update
AFTER UPDATE ON projet
FOR EACH ROW
BEGIN
    UPDATE projet
    SET date_modification = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        sync_status = 'PENDING'
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tache_update
AFTER UPDATE ON tache
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE tache
    SET date_modification = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        sync_status = 'PENDING'
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_session_update
AFTER UPDATE ON session_travail
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE session_travail
    SET date_modification = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        sync_status = 'PENDING'
    WHERE id = NEW.id;
END;


PRAGMA user_version = 1;













// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkv5nyLc0D_FNUhzTtlfj2Zf25ixZNF0Q",
  authDomain: "taches-6e82a.firebaseapp.com",
  projectId: "taches-6e82a",
  storageBucket: "taches-6e82a.firebasestorage.app",
  messagingSenderId: "37837141752",
  appId: "1:37837141752:web:aefb9672e5919f7b252d0d",
  measurementId: "G-FD28ZNRFGE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
