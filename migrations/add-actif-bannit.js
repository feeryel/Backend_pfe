/**
 * Migration : ajoute actif et bannit dans utilisateurs.
 * Usage : node migrations/add-actif-bannit.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

async function run() {
  await sequelize.authenticate();
  console.log("✅ Connexion DB");

  const cols = await sequelize.query(
    `SHOW COLUMNS FROM utilisateurs`,
    { type: QueryTypes.SELECT }
  );
  const names = cols.map(c => c.Field);

  if (!names.includes("actif")) {
    await sequelize.query(
      `ALTER TABLE utilisateurs ADD COLUMN actif TINYINT(1) NOT NULL DEFAULT 1`
    );
    console.log("✅ Colonne actif ajoutée");
  } else {
    console.log("ℹ️  actif déjà présente");
  }

  if (!names.includes("bannit")) {
    await sequelize.query(
      `ALTER TABLE utilisateurs ADD COLUMN bannit TINYINT(1) NOT NULL DEFAULT 0`
    );
    console.log("✅ Colonne bannit ajoutée");
  } else {
    console.log("ℹ️  bannit déjà présente");
  }

  console.log("🎉 Migration terminée");
  process.exit(0);
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
