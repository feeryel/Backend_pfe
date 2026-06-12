require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

async function run() {
  await sequelize.authenticate();

  const cols = await sequelize.query(`SHOW COLUMNS FROM pieces WHERE Field = 'prixAchat'`, { type: QueryTypes.SELECT });

  if (cols.length === 0) {
    await sequelize.query(`
      ALTER TABLE pieces
      ADD COLUMN prixAchat FLOAT NOT NULL DEFAULT 0 AFTER code
    `);
    console.log("✅ Colonne prixAchat ajoutée");
  } else {
    console.log("ℹ️ Colonne prixAchat déjà présente");
  }

  console.log("🎉 Migration terminée");
  process.exit(0);
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
