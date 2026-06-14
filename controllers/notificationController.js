const { Notification } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const data = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 30
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, lu: false }
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!notif) return res.status(404).json({ message: "Notification not found" });

    notif.lu = true;
    await notif.save();

    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { lu: true },
      { where: { userId: req.user.id, lu: false } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
