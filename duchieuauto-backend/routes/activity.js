const express = require("express");
const db = require("../models/db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// Chỉ super_admin xem được lịch sử chỉnh sửa đầy đủ - đây là log giám sát (ai sửa gì lúc nào),
// không phải công việc thường ngày của Content/Ads admin.
router.get("/", requireRole("super_admin"), (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const logs = db.prepare(
        "SELECT id, admin_username, action, target, created_at FROM activity_log ORDER BY id DESC LIMIT ?"
    ).all(limit);
    res.json(logs);
});

module.exports = router;
