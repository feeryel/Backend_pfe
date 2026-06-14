const { Notification, Client } = require("../models");

async function notify({ userId, type, title, message, link = null }) {
  if (!userId) return null;

  try {
    return await Notification.create({ userId, type, title, message, link });
  } catch (err) {
    console.error("[NOTIFICATION ERROR]", err);
    return null;
  }
}

async function notifyClient({ clientId, type, title, message, link = null }) {
  if (!clientId) return null;

  try {
    const client = await Client.findByPk(clientId);
    if (!client || !client.userId) return null;

    return notify({ userId: client.userId, type, title, message, link });
  } catch (err) {
    console.error("[NOTIFICATION ERROR]", err);
    return null;
  }
}

module.exports = { notify, notifyClient };
