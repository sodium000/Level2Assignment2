import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20),
                email VARCHAR(50) UNIQUE NOT NULL,
                password text NOT NULL,
                role VARCHAR(20) DEFAULT 'contributor',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )

            `);

    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
                   id SERIAL PRIMARY KEY,

    title VARCHAR(150) NOT NULL
    CHECK (LENGTH(title) <= 150),

    description TEXT NOT NULL
    CHECK (LENGTH(description) >= 20),

    type VARCHAR(20) NOT NULL,

    status VARCHAR(20) DEFAULT 'open',

    reporter_id INTEGER REFERENCES users(id),

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()
            )

            `);

    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
