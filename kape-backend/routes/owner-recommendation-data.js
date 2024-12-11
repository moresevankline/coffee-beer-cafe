const express = require("express");
const router = express.Router();
const pool = require("../database/coffeeshop.db");
const jwtAuthorize = require("../middleware/jwt.validator");

router.get("/get/owner/monthly-sales", jwtAuthorize, async (req, res) => {
  try {
    const monthlySales = await pool.query(
      `
        SELECT EXTRACT(MONTH FROM order_date) AS month, SUM(subtotal) FROM owner_data
        WHERE EXTRACT(YEAR FROM order_date) = 2024
        GROUP BY month
        ORDER BY month ASC
        `
    );
    res.json(monthlySales.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/owner/store-sales", jwtAuthorize, async (req, res) => {
  try {
    const storeSales = await pool.query(
      `
      SELECT store_name, SUM(subtotal) FROM owner_data
      WHERE EXTRACT(YEAR FROM order_date) = 2024
      GROUP BY store_name
      ORDER BY SUM(subtotal) ASC
      `
    );
    res.json(storeSales.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/owner/average-order-sales", jwtAuthorize, async (req, res) => {
  try {
    const averageOrderSales = await pool.query(
      `
      SELECT AVG(subtotal) FROM owner_data
      WHERE EXTRACT(YEAR FROM order_date) = 2024
      `
    );
    res.json(averageOrderSales.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/owner/top-5-products-with-most-sales", jwtAuthorize, async (req, res) => {
  try {
    const top5MostSalesProducts = await pool.query(
      `
      SELECT product_name, SUM(subtotal) AS sales FROM owner_data
      WHERE EXTRACT(YEAR FROM order_date) = 2024
      GROUP BY product_name
      ORDER BY sales DESC
      LIMIT 5
      `
    );
    res.json(top5MostSalesProducts.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/owner/top-5-products-with-least-sales", jwtAuthorize, async (req, res) => {
  try {
    const top5LeastSalesProducts = await pool.query(
      `
      SELECT product_name, SUM(subtotal) AS sales FROM owner_data
      WHERE EXTRACT(YEAR FROM order_date) = 2024
      GROUP BY product_name
      ORDER BY sales ASC
      LIMIT 5
      `
    );
    res.json(top5LeastSalesProducts.rows);
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;
