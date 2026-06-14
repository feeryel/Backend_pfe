const { Op } = require("sequelize");
const { AuditLog } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const { entity, userId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const where = {};
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum
    });

    res.json({
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
      data: rows
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
