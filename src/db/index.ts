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
                title VARCHAR(20),
                description VARCHAR(50) UNIQUE NOT NULL,
                type text NOT NULL,
                status VARCHAR(20) DEFAULT 'contributor',
                reporter_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )

            `);

            console.log("Database connected successfully!");
    }
    catch (error) {
        console.error("Error initializing database:", error);
    }
};



