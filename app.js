require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("./models"); // important pour charger les relations
const errorMiddleware = require("./middleware/error");

const app = express();
const { initWhatsApp, startWA } = require("./services/whatsappService");

app.use(cors());
app.use(express.json());

/* Routes */
app.use("/admin",            require("./routes/adminRoutes"));
app.use("/clients",          require("./routes/clientRoutes"));
app.use("/appareils",        require("./routes/appareilRoutes"));
app.use("/demandes",         require("./routes/demandeRoutes"));
app.use("/reparations",      require("./routes/reparationRoutes"));
app.use("/pieces",           require("./routes/pieceRoutes"));
app.use("/factures",         require("./routes/factureRoutes"));
app.use("/planning",         require("./routes/planningRoutes"));
app.use("/auth",             require("./routes/authRoutes"));
app.use("/users",            require("./routes/userRoutes"));
app.use("/mail",             require("./routes/mailRoutes"));
app.use("/lignereparations", require("./routes/ligneRoutes"));
app.use("/public/garantie",  require("./routes/garantieRoutes"));

/* Test route */
app.get("/", (req, res) => {
  res.send("Backend PFE Running 🚀");
});
startWA();

/* ✅ Middleware de gestion d'erreurs — doit être APRÈS les routes et AVANT listen */
app.use(errorMiddleware);

/* Connexion + Sync + Lancer serveur */
sequelize.authenticate()
  .then(() => {
    console.log("DB connected");
    return sequelize.sync();
  })
  .then(() => {
    const server = app.listen(3000, () => {
      console.log("Server running on port 3000");
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  })
  .catch(err => {
    console.error('Startup error:', err);
  });

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason, 'promise:', promise);
});

process.on('exit', (code) => {
  console.log('Process exiting with code', code);
});
