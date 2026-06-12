require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

async function run() {
  await sequelize.authenticate();

  // Normalise les valeurs existantes invalides avant de poser l'ENUM
  await sequelize.query(`
    UPDATE demandes_reparation
    SET etat = 'En attente'
    WHERE etat IS NULL OR etat NOT IN ('En attente', 'En cours', 'Terminée')
  `);

  const cols = await sequelize.query(`SHOW COLUMNS FROM demandes_reparation WHERE Field = 'etat'`, { type: QueryTypes.SELECT });

  if (cols[0]?.Type !== "enum('En attente','En cours','Terminée')") {
    await sequelize.query(`
      ALTER TABLE demandes_reparation
      MODIFY COLUMN etat ENUM('En attente','En cours','Terminée') NOT NULL DEFAULT 'En attente'
    `);
    console.log("✅ Colonne etat convertie en ENUM");
  } else {
    console.log("ℹ️ Colonne etat déjà en ENUM");
  }

  console.log("🎉 Migration terminée");
  process.exit(0);
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
