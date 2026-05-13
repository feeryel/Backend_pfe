const { Client, Appareil } = require("../models");
const { Op, fn, col, where } = require("sequelize");

const normalize = (str = "") =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

exports.create = async (req, res) => {
  try {
    console.log("Données reçues pour création:", req.body);

    // Création du client
    const client = await Client.create(req.body);

    res.status(201).json({
      message: "Client créé avec succès",
      data: client
    });
  } catch (error) {
    console.error("Erreur lors de la création du client:", error);

    // Gestion d’erreurs plus précise
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Le numéro de téléphone existe déjà." });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }

    res.status(500).json({ error: "Erreur serveur" });
  }
};



// ================= GET ALL =================
exports.getAll = async (req, res) => {
  try {
    let { adresse } = req.query;

    let values = [];

    if (Array.isArray(adresse)) {
      values = adresse;
    } 
    else if (typeof adresse === "string") {
      values = adresse.split(/\s*or\s*|\s*,\s*/i);
    }

    values = values
      .map(v => normalize(v))
      .filter(v => v && v !== "null" && v !== "undefined");

    let condition = null;

    if (values.length > 0) {
      condition = {
        [Op.or]: values.map(v => ({
          adresse: {
            [Op.like]: `%${v}%`
          }
        }))
      };
    }

    const clients = await Client.findAll({
      where: condition ?? undefined,
      include: Appareil
    });

    return res.json(clients);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};



exports.getOne = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: "Client non trouvé" });
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Client.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: "Client non trouvé" });
    res.json({ message: "Client mis à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.delete = async (req, res) => {
  try {

    if (!req.params.id || isNaN(req.params.id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const deleted = await Client.destroy({
      where: { id: req.params.id }
    });

    if (!deleted)
      return res.status(404).json({ error: "Client non trouvé" });

    res.json({ message: "Client supprimé" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};