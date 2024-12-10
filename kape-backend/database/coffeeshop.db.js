const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    // connectionString: process.env.DB_URL,
    // connectionString: process.env.DB_URL,
    // ssl: process.env.DB_URL
    //     ? { rejectUnauthorized: false } // Disable certificate verification for self-signed certificates
    //     : false, // No SSL if DB_URL is not provided
});

module.exports = pool;
