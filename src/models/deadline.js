// Run this from server.js — checks every hour for tasks with ≤48h deadline
// and auto-floats a pinned alert notice visible to all employees.

import { floatDeadlineNotices } from "../routes/taskRoute.js";

export function startDeadlineCron() {
  const INTERVAL_MS = 60 * 60 * 1000; // every 1 hour

  const run = async () => {
    try {
      const count = await floatDeadlineNotices();
      if (count > 0) {
        console.log(`[DeadlineCron] Floated ${count} deadline notice(s) at ${new Date().toISOString()}`);
      }
    } catch (err) {
      console.error("[DeadlineCron] Error:", err.message);
    }
  };

  // Run immediately on startup, then every hour
  run();
  setInterval(run, INTERVAL_MS);
  console.log("[DeadlineCron] Started — checking every hour for upcoming deadlines");
}