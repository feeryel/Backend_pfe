require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

async function run() {
  await sequelize.authenticate();

  const cols = await sequelize.query(`SHOW COLUMNS FROM devis WHERE Field IN ('montantPieces', 'montantMainOeuvre')`, { type: QueryTypes.SELECT });
  const existing = cols.map(c => c.Field);

  if (!existing.includes("montantPieces")) {
    await sequelize.query(`ALTER TABLE devis ADD COLUMN montantPieces FLOAT NOT NULL DEFAULT 0 AFTER montantHT`);
    console.log("✅ Colonne montantPieces ajoutée");
  } else {
    console.log("ℹ️ Colonne montantPieces déjà présente");
  }

  if (!existing.includes("montantMainOeuvre")) {
    await sequelize.query(`ALTER TABLE devis ADD COLUMN montantMainOeuvre FLOAT NOT NULL DEFAULT 0 AFTER montantPieces`);
    console.log("✅ Colonne montantMainOeuvre ajoutée");
  } else {
    console.log("ℹ️ Colonne montantMainOeuvre déjà présente");
  }

  console.log("🎉 Migration terminée");
  process.exit(0);
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
