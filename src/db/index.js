import pg from "pg";

let _pool;

export function getPool() {
  if (!_pool) {
    const needsSsl = process.env.DATABASE_URL?.includes("render.com");
    _pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    });
    _pool.on("error", (err) => {
      console.error("Postgres pool error:", err);
    });
  }
  return _pool;
}
