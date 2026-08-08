/**
 * Port từ duchieuauto-backend/routes/activity.js sang Hono (Phase 13). Giữ nguyên 100% logic.
 */
import { Hono } from "hono";
import { requireRole } from "../middleware/auth.js";

const app = new Hono();

app.get("/", ...requireRole("super_admin"), async (c) => {
    const limit = Math.min(parseInt(c.req.query("limit"), 10) || 100, 500);
    const db = c.get("db");
    const logs = await db.prepare(
        "SELECT id, admin_username, action, target, created_at FROM activity_log ORDER BY id DESC LIMIT ?"
    ).all(limit);
    return c.json(logs);
});

export default app;
