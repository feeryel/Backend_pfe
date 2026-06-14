const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/notificationController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");

router.get("/",              auth, active, ctrl.getAll);
router.get("/unread-count",  auth, active, ctrl.getUnreadCount);
router.patch("/:id/read",    auth, active, ctrl.markAsRead);
router.patch("/read-all",    auth, active, ctrl.markAllAsRead);

module.exports = router;
