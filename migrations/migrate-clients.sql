-- =============================================================================
-- MIGRATION : Authentification clients
-- Base de données : atelier_reparation
-- Exécuter une seule fois sur la base de données existante
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ÉTAPE 1 : S'assurer que le rôle 'client' est dans l'ENUM utilisateurs
-- -----------------------------------------------------------------------------
ALTER TABLE utilisateurs
  MODIFY COLUMN role ENUM(
    'admin',
    'client',
    'technicien',
    'responsable_reception',
    'responsable_reparation',
    'responsable_achat_stock'
  ) NOT NULL;

-- -----------------------------------------------------------------------------
-- ÉTAPE 2 : Ajouter la colonne userId dans clients (si absente)
-- -----------------------------------------------------------------------------
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS userId INT NULL UNIQUE,
  ADD CONSTRAINT IF NOT EXISTS fk_clients_user
    FOREIGN KEY (userId) REFERENCES utilisateurs(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- ÉTAPE 3 : Créer un compte utilisateur pour chaque client existant
--
-- login           = email du client
-- motDePasse      = bcrypt('123456', cost=10)
-- role            = 'client'
--
-- Hash pré-calculé de '123456' (cost=10) :
--   $2b$10$SnOnq5M0ekoW9y7bvcCWWOmRQKsXdd.dv7AH08iYm0tFocsc0p50K
--
-- ⚠️  Si vous re-exécutez ce script, la clause INSERT IGNORE évite les doublons.
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO utilisateurs (login, motDePasse, role, createdAt, updatedAt)
SELECT
  c.email                                                         AS login,
  '$2b$10$SnOnq5M0ekoW9y7bvcCWWOmRQKsXdd.dv7AH08iYm0tFocsc0p50K' AS motDePasse,
  'client'                                                        AS role,
  NOW()                                                           AS createdAt,
  NOW()                                                           AS updatedAt
FROM clients c
WHERE c.userId IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM utilisateurs u WHERE u.login = c.email
  );

-- -----------------------------------------------------------------------------
-- ÉTAPE 4 : Relier chaque client à son compte utilisateur (via userId)
-- -----------------------------------------------------------------------------
UPDATE clients c
  JOIN utilisateurs u ON u.login = c.email
SET c.userId = u.id
WHERE c.userId IS NULL;

-- -----------------------------------------------------------------------------
-- VÉRIFICATION (optionnel — décommenter pour contrôler le résultat)
-- -----------------------------------------------------------------------------
-- SELECT c.id, c.nom, c.email, c.userId, u.login, u.role
-- FROM clients c
-- LEFT JOIN utilisateurs u ON c.userId = u.id
-- ORDER BY c.id;

-- =============================================================================
-- FIN DE MIGRATION
-- Mot de passe initial de tous les clients : 123456
-- Invitez vos clients à le modifier après leur première connexion.
-- =============================================================================
