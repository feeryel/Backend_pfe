const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("./models"); // important pour charger les relations
const errorMiddleware = require("./middleware/error");

const app = express();

app.use(cors());
app.use(express.json());

/* Routes */
app.use("/clients", require("./routes/clientRoutes"));
app.use("/appareils", require("./routes/appareilRoutes"));
app.use("/demandes", require("./routes/demandeRoutes"));
app.use("/reparations", require("./routes/reparationRoutes"));
app.use("/pieces", require("./routes/pieceRoutes"));
app.use("/factures", require("./routes/factureRoutes"));
app.use("/planning", require("./routes/planningRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/lignereparations", require("./routes/ligneRoutes"));
/* Test route */
app.get("/", (req, res) => {
  res.send("Backend PFE Running 🚀");
});

/* Connexion + Sync + Lancer serveur */
sequelize.authenticate()
  .then(() => {
    console.log("DB connected");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch(err => console.log(err));

/* Middleware de gestion d’erreurs */
app.use(errorMiddleware);