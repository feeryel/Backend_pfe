const { AuditLog } = require("../models");

async function logAction({ userId = null, userLogin = null, action, entity, entityId = null, details = null }) {
  try {
    await AuditLog.create({
      userId,
      userLogin,
      action,
      entity,
      entityId,
      details: details ? (typeof details === "string" ? details : JSON.stringify(details)) : null
    });
  } catch (err) {
    console.error("[AUDIT LOG ERROR]", err);
  }
}

module.exports = { logAction };
