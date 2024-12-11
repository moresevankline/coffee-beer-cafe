const express = require("express");
const router = express.Router();
const pool = require("../database/coffeeshop.db");
const jwtAuthorize = require("../middleware/jwt.validator");

router.get("/get/manager/monthly-sales/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const { store_id } = req.params;
    const monthlySales = await pool.query(
      `
          SELECT EXTRACT(MONTH FROM order_date) AS month, SUM(subtotal) FROM owner_data
          WHERE EXTRACT(YEAR FROM order_date) = 2024 AND store_name = (
            SELECT store_name FROM store_location
            WHERE store_id = $1
          ) 
          GROUP BY month
          ORDER BY month ASC
        `, [store_id]
    );
    res.json(monthlySales.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/manager/store-sales/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const { store_id } = req.params;
    const storeSales = await pool.query(
      `
      SELECT SUM(subtotal) FROM owner_data
      WHERE EXTRACT(YEAR FROM order_date) = 2024 AND store_name = (
            SELECT store_name FROM store_location
            WHERE store_id = $1
          ) 
      `, [store_id]
    );
    res.json(storeSales.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/manager/average-order-sales/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const { store_id } = req.params;
    const averageOrderSales = await pool.query(
      `
      SELECT AVG(subtotal) FROM owner_data
      WHERE EXTRACT(YEAR FROM order_date) = 2024 AND store_name = (
            SELECT store_name FROM store_location
            WHERE store_id = $1
          ) 
      `, [store_id]
    );
    res.json(averageOrderSales.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/manager/top-5-products-with-most-sales/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const { store_id } = req.params;
    const top5MostSalesProducts = await pool.query(
      `
      SELECT product_name, SUM(subtotal) AS sales FROM owner_data
      WHERE EXTRACT(YEAR FROM order_date) = 2024 AND store_name = (
            SELECT store_name FROM store_location
            WHERE store_id = $1
          ) 
      GROUP BY product_name
      ORDER BY sales DESC
      LIMIT 5
      `, [store_id]
    );
    res.json(top5MostSalesProducts.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/manager/top-5-products-with-least-sales/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const { store_id } = req.params;
    const top5LeastSalesProducts = await pool.query(
      `
      SELECT product_name, SUM(subtotal) AS sales FROM owner_data
      WHERE EXTRACT(YEAR FROM order_date) = 2024 AND store_name = (
            SELECT store_name FROM store_location
            WHERE store_id = $1
          ) 
      GROUP BY product_name
      ORDER BY sales ASC
      LIMIT 5
      `, [store_id]
    );
    res.json(top5LeastSalesProducts.rows);
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;
