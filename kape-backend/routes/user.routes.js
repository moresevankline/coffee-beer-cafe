const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../database/coffeeshop.db");
const jwtGenerator = require("../utils/jwt.generator");
const jwtAuthorize = require("../middleware/jwt.validator");

//add route
router.post("/add/user", async (req, res) => {
    const { first_name, last_name, role, email, password } =
        req.body;

    // Ensure all necessary fields are provided
    if (
        !first_name ||
        !last_name ||
        !role ||
        !email ||
        !password
    ) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Hash the password
        const saltRounds = 10; // You can adjust the salt rounds as needed
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user data into the users table with the hashed password
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, role, email, password) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [first_name, last_name, birth_date, role, email, hashedPassword]
        );

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0],
        });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Ensure email and password are provided
    if (!email || !password) {
        return res
            .status(400)
            .json({ error: "Email and password are required" });
    }

    try {
        // Check if user exists
        const userResult = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = userResult.rows[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwtGenerator(user.user_id, user.role); // Adjust this line if your jwtGenerator requires different parameters

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                email: user.email,
                store_id: user.store_id,
            },
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/get/managers", async (req, res) => {
    try {
        const query = `
            SELECT user_id, first_name, last_name, email, store_location.store_name
            FROM users
            JOIN store_location
            USING(store_id)
            WHERE role = 'manager'
        `;

        const users = await pool.query(query);
        return res.json(users.rows);
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error; // Handle error as needed
    }
});

router.put("/update/manager/:id", jwtAuthorize, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, password, store_name } = req.body;

    try {
        let query = `
            UPDATE users 
            SET first_name = $1, last_name = $2, birth_date = $3, email = $4,
            store_id = (
                SELECT store_id
                FROM store_location
                WHERE store_name = $5
            )
        `;
        const values = [firstName, lastName, email, store_name];
        let paramIndex = values.length + 1;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `, password = $${paramIndex}`;
            values.push(hashedPassword);
            paramIndex++;
        }

        query += ` WHERE user_id = $${paramIndex} RETURNING *`;
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Manager not found" });
        }

        res.json({
            message: "Manager updated successfully",
            manager: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating manager data:", error);
        return res.status(500).json({
            message: "Error updating manager",
            error: error.message,
        });
    }
});

router.delete("/delete/manager/:id", jwtAuthorize, async (req, res) => {
    const { id } = req.params;
    console.log("Received DELETE request for manager ID:", id);

    try {
        const query = `DELETE FROM users WHERE user_id = $1 RETURNING *`;
        const values = [id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            console.log("Manager not found");
            return res.status(404).json({ message: "Manager not found" });
        }

        console.log("Manager deleted successfully:", result.rows[0]);
        res.json({
            message: "Manager deleted successfully",
            manager: result.rows[0],
        });
    } catch (error) {
        console.error("Error deleting manager:", error);
        return res.status(500).json({
            message: "Error deleting manager",
            error: error.message,
        });
    }
});

router.post("/add/manager", jwtAuthorize, async (req, res) => {
    const { firstName, lastName, birthDate, email, password, store_id } =
        req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds of salting

        // SQL query to insert a new user into the users table, setting role to 'manager'
        const query = `
            INSERT INTO users (first_name, last_name, role, email, password, store_id)
            VALUES ($1, $2, 'manager', $3, $4, $5) 
            RETURNING * 
        `;

        // Use parameterized query to prevent SQL injection
        const values = [
            firstName,
            lastName,
            email,
            hashedPassword,
            store_id,
        ];

        // Execute the query
        const users = await pool.query(query, values);

        res.json(users.rows);
    } catch (error) {
        console.error("Error inserting user data:", error);
        return res.status(500).json({
            message: "Error creating user",
            error: error.message, // Include error message in response
        });
    }
});

router.post("/auth-verify", jwtAuthorize, (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.get("/get/owners", jwtAuthorize, async (req, res) => {
    try {
        const query = `
            SELECT user_id, first_name, last_name, email
            FROM public.users
            WHERE role = 'owner'
        `;

        const users = await pool.query(query);
        return res.json(users.rows);
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error; // Handle error as needed
    }
});

router.post("/add/owner", jwtAuthorize, async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Ensure all necessary fields are provided
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // Adjust salt rounds as needed

        // SQL query to insert a new owner into the users table
        const query = `
            INSERT INTO users (first_name, last_name, role, email, password)
            VALUES ($1, $2, 'owner', $3, $4)
            RETURNING * 
        `;

        // Use parameterized query to prevent SQL injection
        const values = [firstName, lastName, email, hashedPassword];

        // Execute the query
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Owner created successfully",
            owner: result.rows[0],
        });
    } catch (error) {
        console.error("Error inserting owner data:", error);
        res.status(500).json({
            message: "Error creating owner",
            error: error.message,
        });
    }
});

router.delete("/delete/owner/:id", jwtAuthorize, async (req, res) => {
    const { id } = req.params;

    try {
        // Delete the owner user with the given user_id
        const query = `DELETE FROM users WHERE user_id = $1 AND role = 'owner' RETURNING *`;
        const values = [id];

        // Execute the query
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Owner not found" });
        }

        res.json({
            message: "Owner deleted successfully",
            owner: result.rows[0],
        });
    } catch (error) {
        console.error("Error deleting owner:", error);
        res.status(500).json({
            message: "Error deleting owner",
            error: error.message,
        });
    }
});

router.put("/update/owner/:id", jwtAuthorize, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    // Ensure the required fields are provided (except password)
    if (!firstName || !lastName || !email) {
        return res
            .status(400)
            .json({ error: "All fields except password are required" });
    }

    try {
        // Prepare the base query for updating owner information
        let query = `UPDATE users SET first_name = $1, last_name = $2, email = $3`;
        let values = [firstName, lastName, email];

        query += ` WHERE user_id = $4 AND role = 'owner' RETURNING *`;
        values.push(id); // Add the user ID for the WHERE clause

        // Execute the update query
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Owner not found" });
        }

        res.json({
            message: "Owner updated successfully",
            owner: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating owner data:", error);
        res.status(500).json({
            message: "Error updating owner",
            error: error.message,
        });
    }
});

module.exports = router;
