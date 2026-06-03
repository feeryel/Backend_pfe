/**
 * Migration : ajoute userId dans clients + crée un compte utilisateur
 * pour chaque client existant.
 *
 * Usage : node migrations/migrate-clients.js
 *
 *   login            = email du client
 *   motDePasse       = bcrypt('123456')   ← mot de passe initial
 *   role             = 'client'
 *   clients.userId   = id du compte créé  (OneToOne)
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const sequelize = require("../config/database");
const bcrypt    = require("bcrypt");
const { QueryTypes } = require("sequelize");

const DEFAULT_PASSWORD = "123456";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Retourne la liste des valeurs actuelles de l'ENUM role */
async function getEnumValues() {
  const [row] = await sequelize.query(
    `SELECT COLUMN_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME   = 'utilisateurs'
       AND COLUMN_NAME  = 'role'`,
    { type: QueryTypes.SELECT }
  );
  if (!row) throw new Error("Colonne 'role' introuvable dans utilisateurs");
  // "enum('admin','technicien','reception',...)" → ['admin','technicien','reception',...]
  const matches = row.COLUMN_TYPE.match(/'([^']+)'/g) ?? [];
  return matches.map(m => m.replace(/'/g, ""));
}

/** Ajoute 'client' à l'ENUM si absent, sans toucher aux autres valeurs */
async function ensureClientRole() {
  const current = await getEnumValues();
  console.log("   ENUM actuel :", current.join(", "));

  if (current.includes("client")) {
    console.log("ℹ️  'client' déjà dans l'ENUM — pas de modification");
    return;
  }

  console.log("⚠️  'client' absent — ajout en cours…");

  // Nouveau ENUM = valeurs existantes + 'client' en tête
  const newValues = ["client", ...current].map(v => `'${v}'`).join(", ");

  // SET SESSION sql_mode='' évite que MySQL rejette l'ALTER à cause du mode strict
  await sequelize.query(`SET SESSION sql_mode = ''`);
  await sequelize.query(
    `ALTER TABLE utilisateurs MODIFY COLUMN role ENUM(${newValues}) NOT NULL`
  );

  // Vérification post-ALTER
  const updated = await getEnumValues();
  if (!updated.includes("client")) {
    throw new Error(
      "L'ALTER TABLE n'a pas appliqué 'client'.\n" +
      "Exécutez manuellement :\n\n" +
      `  ALTER TABLE utilisateurs MODIFY COLUMN role ENUM(${newValues}) NOT NULL;\n\n` +
      "Puis relancez : node migrations/migrate-clients.js"
    );
  }

  console.log("✅ ENUM role mis à jour :", updated.join(", "));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion DB établie");

    // ── 1. S'assurer que 'client' est dans l'ENUM ───────────────────────────
    await ensureClientRole();

    // ── 2. userId dans clients : déjà présent ou à ajouter ─────────────────
    const [col] = await sequelize.query(
      `SHOW COLUMNS FROM clients LIKE 'userId'`,
      { type: QueryTypes.SELECT }
    );

    if (!col) {
      await sequelize.query(`
        ALTER TABLE clients
          ADD COLUMN userId INT NULL UNIQUE,
          ADD CONSTRAINT fk_clients_user
            FOREIGN KEY (userId) REFERENCES utilisateurs(id)
            ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log("✅ Colonne userId ajoutée dans clients");
    } else {
      console.log("ℹ️  Colonne userId déjà présente — ALTER ignoré");
    }

    // ── 3. Récupérer les clients sans userId ────────────────────────────────
    const clients = await sequelize.query(
      `SELECT id, nom, email, numTel FROM clients WHERE userId IS NULL`,
      { type: QueryTypes.SELECT }
    );

    if (clients.length === 0) {
      console.log("ℹ️  Aucun client à migrer — migration terminée");
      process.exit(0);
    }

    console.log(`\n📋 ${clients.length} client(s) à migrer…`);

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    let created = 0;
    let linked  = 0;

    for (const client of clients) {
      const [existing] = await sequelize.query(
        `SELECT id FROM utilisateurs WHERE login = :login`,
        { replacements: { login: client.email }, type: QueryTypes.SELECT }
      );

      let userId;

      if (existing) {
        userId = existing.id;
        console.log(`  ⚠️  "${client.nom}" → compte existant réutilisé (userId=${userId})`);
        linked++;
      } else {
        const [insertId] = await sequelize.query(
          `INSERT INTO utilisateurs (login, motDePasse, role, createdAt, updatedAt)
           VALUES (:login, :motDePasse, 'client', NOW(), NOW())`,
          {
            replacements: { login: client.email, motDePasse: hashedPassword },
            type: QueryTypes.INSERT
          }
        );
        userId = insertId;
        console.log(`  ✅ "${client.nom}" → compte créé (userId=${userId}, login=${client.email})`);
        created++;
      }

      await sequelize.query(
        `UPDATE clients SET userId = :userId WHERE id = :clientId`,
        { replacements: { userId, clientId: client.id } }
      );
    }

    console.log(`
🎉 Migration terminée :
   • ${created} compte(s) créé(s)
   • ${linked}  compte(s) existant(s) liés
   • Mot de passe initial : ${DEFAULT_PASSWORD}
   ⚠️  Invitez vos clients à changer leur mot de passe dès la première connexion.
`);
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Erreur de migration :", err.message ?? err);
    process.exit(1);
  }
}

run();
