const Database = require("better-sqlite3");
const db = new Database("data/ayla.db");
const tables = ["gallery_items", "blog_posts", "packages", "site_settings", "newsletter_subscribers", "bookings"];
const data = {};

for(const t of tables) {
  try {
    data[t] = db.prepare(`SELECT * FROM ${t}`).all();
  } catch(e) {
    console.error(`Error reading ${t}:`, e.message);
  }
}

console.log(JSON.stringify(data, null, 2));
