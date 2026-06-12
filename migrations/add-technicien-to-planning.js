/**
 * Migration : ajoute technicienId, description et statut dans plannings.
 * Usage : node migrations/add-technicien-to-planning.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

async function run() {
  await sequelize.authenticate();
  console.log("✅ Connexion DB");

  const cols = await sequelize.query(
    `SHOW COLUMNS FROM plannings`,
    { type: QueryTypes.SELECT }
  );
  const names = cols.map(c => c.Field);

  if (!names.includes("technicienId")) {
    await sequelize.query(
      `ALTER TABLE plannings ADD COLUMN technicienId INT NULL`
    );
    console.log("✅ Colonne technicienId ajoutée");
  } else {
    console.log("ℹ️  technicienId déjà présente");
  }

  if (!names.includes("description")) {
    await sequelize.query(
      `ALTER TABLE plannings ADD COLUMN description VARCHAR(255) NULL`
    );
    console.log("✅ Colonne description ajoutée");
  } else {
    console.log("ℹ️  description déjà présente");
  }

  if (!names.includes("statut")) {
    await sequelize.query(
      `ALTER TABLE plannings ADD COLUMN statut ENUM('PLANIFIE','EN_COURS','TERMINE') NOT NULL DEFAULT 'PLANIFIE'`
    );
    console.log("✅ Colonne statut ajoutée");
  } else {
    console.log("ℹ️  statut déjà présente");
  }

  console.log("🎉 Migration terminée");
  process.exit(0);
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
