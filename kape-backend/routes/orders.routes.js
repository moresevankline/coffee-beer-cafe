const express = require("express");
const router = express.Router();
const pool = require("../database/coffeeshop.db");
const jwtAuthorize = require("../middleware/jwt.validator");

router.post("/add/order", jwtAuthorize, async (req, res) => {
  try {
    const { order_date, order_time, order_type, transaction_number, store_id, total } =
      req.body; // Adjusted to total_amount
    const query = `
            INSERT INTO orders (order_date, order_time, order_type, transaction_number, store_id, total_amount)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

    // Execute the query with the provided values
    const newOrder = await pool.query(query, [
      order_date,
      order_time,
      order_type,
      transaction_number,
      store_id,
      total,
    ]);

    return res.json(newOrder.rows[0]);
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Error adding order" });
  }
});

router.post("/add/order-list", jwtAuthorize, async (req, res) => {
  try {
    const { order_id, product_id, quantity, sub_total } = req.body; // Adjusted to total_amount
    const query = `
            INSERT INTO order_list (order_id, product_id, quantity, subtotal)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

    // Execute the query with the provided values
    const newOrder = await pool.query(query, [
      order_id,
      product_id,
      quantity,
      sub_total,
    ]);

    await pool.query('REFRESH MATERIALIZED VIEW owner_data;');
    await pool.query('REFRESH MATERIALIZED VIEW manager_data_batangas;');
    await pool.query('REFRESH MATERIALIZED VIEW manager_data_tiaong;');
    await pool.query('REFRESH MATERIALIZED VIEW manager_data_carmona;');
    await pool.query('REFRESH MATERIALIZED VIEW manager_data_one_ayala;');
    return res.json(newOrder.rows[0]);
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Error adding order" });
  }
});

router.get("/get/orders", jwtAuthorize, async (req, res) => {
  try {
    const query = `
            SELECT orders.*, store_location.store_name
            FROM orders
            JOIN store_location ON orders.store_id = store_location.store_id
            ORDER BY orders.order_date DESC;
        `;

    // Execute the query to get all orders along with store name
    const orders = await pool.query(query);

    return res.json(orders.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.get("/get/orders/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const { store_id } = req.params;
    const query = `
            SELECT orders.*, store_location.store_name
            FROM orders
            JOIN store_location ON orders.store_id = store_location.store_id
            WHERE orders.store_id = $1
            ORDER BY orders.order_date DESC;
        `;

    // Execute the query to get all orders along with store name
    const orders = await pool.query(query, [store_id]);

    return res.json(orders.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.get("/get/specific-orders", jwtAuthorize, async (req, res) => {
  try {
    const { year, store_id } = req.query; // Get 'year' and 'store_id' from the query parameters
    console.log(year, store_id);
    let query = `
            SELECT orders.*, store_location.store_name
            FROM orders
            JOIN store_location ON orders.store_id = store_location.store_id
            WHERE EXTRACT(YEAR FROM orders.order_date) = $1
        `;

    // Prepare query parameters
    const queryParams = [year];

    // If a store is selected (and it's not 'All'), filter by store_id
    if (store_id && store_id !== "All") {
      query += ` AND orders.store_id = $2`;
      queryParams.push(store_id);
    }

    query += ` ORDER BY orders.order_date DESC`;

    // Execute the query to get orders with the filter conditions
    const orders = await pool.query(query, queryParams);

    return res.json(orders.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.get("/get/top-sold-products", jwtAuthorize, async (req, res) => {
  try {
    // SQL query to find the top 5 most sold products based on total quantity
    const query = `
            SELECT 
                p.product_id,
                p.product_name,
                SUM(ol.quantity) AS total_quantity
            FROM 
                order_list ol
            INNER JOIN 
                products p ON ol.product_id = p.product_id
            GROUP BY 
                p.product_id, p.product_name
            ORDER BY 
                total_quantity DESC
            LIMIT 5;
        `;
    // Execute the query
    const result = await pool.query(query);

    // Respond with the top 5 most sold products
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching top sold products:", error);
    res.status(500).json({ message: "Error fetching top sold products" });
  }
});

// router.get("/get/top-sold-products-no-limit/:year", async (req, res) => {
//     try {
//         // Extract the 'year' parameter from the URL (e.g., /get/top-sold-products/2022)
//         const { year } = req.params;

//         // Check if the year parameter is valid (e.g., 4-digit year)
//         if (!year || isNaN(year) || year.length !== 4) {
//             return res.status(400).json({ message: "Invalid year parameter" });
//         }

//         const query = `
//         SELECT
//     p.product_id,
//     p.product_name,
//     c.category_name,
//     COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM o.order_date) = $1 THEN ol.quantity ELSE 0 END), 0) AS total_quantity,
//     COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM o.order_date) = $1 THEN ol.subtotal ELSE 0 END), 0) AS total_sales
// FROM
//     products p
// LEFT JOIN
//     order_list ol ON p.product_id = ol.product_id
// LEFT JOIN
//     orders o ON ol.order_id = o.order_id
// INNER JOIN
//     categories c ON p.category_id = c.category_id
// GROUP BY
//     p.product_id, p.product_name, c.category_name
// ORDER BY
//     total_sales DESC;  -- Sort by total sales

//         `;

//         // Execute the query with the 'year' parameter
//         const result = await pool.query(query, [year]);

//         // Respond with the top sold products and total sales for the specified year
//         return res.json(result.rows);
//     } catch (error) {
//         console.error("Error fetching top sold products:", error);
//         res.status(500).json({ message: "Error fetching top sold products" });
//     }
// });

router.get(
  "/get/top-sold-products-no-limit/:year/:store_id", jwtAuthorize,
  async (req, res) => {
    try {
      // Extract the 'year' and 'store_id' parameters from the URL
      const { year, store_id } = req.params;

      // Check if the year parameter is valid (e.g., 4-digit year)
      if (!year || isNaN(year) || year.length !== 4) {
        return res.status(400).json({ message: "Invalid year parameter" });
      }

      // Construct the base query
      let query = `
            SELECT
     p.product_id,
     p.product_name,
     c.category_name,
     COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM o.order_date) = $1 THEN ol.quantity ELSE 0 END), 0) AS total_quantity,
     COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM o.order_date) = $1 THEN ol.subtotal ELSE 0 END), 0) AS total_sales
 FROM
     products p
        LEFT JOIN 
            order_list ol ON p.product_id = ol.product_id
        LEFT JOIN 
            orders o ON ol.order_id = o.order_id
        INNER JOIN 
            categories c ON p.category_id = c.category_id
        WHERE 
            EXTRACT(YEAR FROM o.order_date) = $1
        `;

      const queryParams = [year]; // Initial parameters include only the year

      // If store_id is not "All", include the store_id filter in the query
      if (store_id !== "All") {
        query += ` AND o.store_id = $2`; // Add condition for store_id
        queryParams.push(store_id); // Add store_id to the query parameters
      }

      // Group by product and category, and order by total_sales
      query += `
        GROUP BY 
            p.product_id, p.product_name, c.category_name
        ORDER BY 
            total_sales DESC;
        `;

      // Execute the query with the provided parameters
      const result = await pool.query(query, queryParams);

      // Respond with the top sold products and total sales for the specified year and store (if applicable)
      return res.json(result.rows);
    } catch (error) {
      console.error("Error fetching top sold products:", error);
      res.status(500).json({
        message: "Error fetching top sold products",
      });
    }
  }
);

router.get("/get/specific-orders", jwtAuthorize, async (req, res) => {
  try {
    const { year, store_id } = req.query;
    console.log(year, store_id);

    let query = `
            SELECT orders.*, store_location.store_name
            FROM orders
            JOIN store_location ON orders.store_id = store_location.store_id
            WHERE EXTRACT(YEAR FROM orders.order_date) = $1
        `;

    const queryParams = [year];

    if (store_id && store_id !== "All") {
      query += "AND orders.store_id = $2";
      queryParams.push(store_id);
    }

    query += "ORDER BY orders.order_date DESC";

    const orders = await pool.query(query, queryParams);

    return res.json(orders.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.get(
  "/get/peak-hours/:year/:store_id",
  jwtAuthorize,
  async (req, res) => {
    const { year, store_id } = req.params;

    const isAllStores = store_id === "All";
    const storeID = isAllStores ? null : parseInt(store_id);

    // Dynamic WHERE clause for store_id
    const storeCondition = isAllStores ? "" : "AND store_id = $2";

    const query = `
            SELECT 
                order_year,
                order_month,
                order_hour,
                total_orders,
                total_sales
            FROM (
                SELECT 
                    EXTRACT(YEAR FROM orders.order_date) AS order_year,
                    EXTRACT(MONTH FROM orders.order_date) AS order_month,
                    DATE_PART('hour', orders.order_time) AS order_hour,
                    COUNT(orders.order_id) AS total_orders,
                    SUM(order_list.subtotal) AS total_sales,
                    RANK() OVER (PARTITION BY EXTRACT(YEAR FROM orders.order_date), EXTRACT(MONTH FROM orders.order_date) ORDER BY COUNT(orders.order_id) DESC) AS rank
                FROM orders
                JOIN order_list ON orders.order_id = order_list.order_id
                WHERE EXTRACT(YEAR FROM orders.order_date) = $1 ${storeCondition}
                GROUP BY order_year, order_month, order_hour
            ) ranked_orders
            WHERE rank = 1
            ORDER BY order_year, order_month;
        `;

    try {
      const params = isAllStores ? [year] : [year, storeID];
      const result = await pool.query(query, params);

      if (result.rows.length > 0) {
        res.status(200).json(result.rows);
      } else {
        res.status(404).json({
          message: "No data found for the specified year.",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/get/order-list/:order_id", jwtAuthorize, async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const query = `SELECT * FROM order_list inner join products on products.product_id = order_list.product_id WHERE order_id = $1 LIMIT 10;`;
    const result = await pool.query(query, [order_id]);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching top sold products:", error);
    res.status(500).json({ message: "Error fetching top sold products" });
  }
});

router.get("/get/annual-orders/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const query = `SELECT
    EXTRACT(YEAR FROM order_date) AS sales_year,
    SUM(total_amount) AS total_sales
FROM
    orders
WHERE
    ($1 = 'All' OR store_id = $1::integer)
GROUP BY
    EXTRACT(YEAR FROM order_date)
ORDER BY
    sales_year;
`;
    const result = await pool.query(query, [req.params.store_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
