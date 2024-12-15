const express = require("express");
const router = express.Router();
const pool = require("../database/coffeeshop.db");
const jwtAuthorize = require("../middleware/jwt.validator");
const multer = require("multer");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/get/products", jwtAuthorize, async (req, res) => {
  try {
    const query = `SELECT * FROM products INNER JOIN categories on categories.category_id = products.category_id ORDER BY product_id ASC`;
    const productswithcategories = await pool.query(query);
    return res.json(productswithcategories.rows);
  } catch (error) {
    console.error(error);
  }
});

router.get("/get/products/manager/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const { store_id } = req.params;
    const query = `
    SELECT * FROM products INNER JOIN categories on categories.category_id = products.category_id WHERE store_id = $1
    `;
    const productswithcategories = await pool.query(query, [store_id]);
    return res.json(productswithcategories.rows);
  } catch (error) {
    console.error(error);
  }
});

router.get("/get/products-by-type/:type", jwtAuthorize, async (req, res) => {
  try {
    const { type } = req.params;
    const query = `SELECT * FROM products INNER JOIN categories on categories.category_id = products.category_id where products.product_type = $1`;
    const productswithcategories = await pool.query(query, [type]);
    return res.json(productswithcategories.rows);
  } catch (error) {
    console.error(error);
  }
});

router.get("/get/products/total-sales", jwtAuthorize, async (req, res) => {
  try {
    const totalSales = await pool.query(
      "SELECT SUM(subtotal) FROM owner_data WHERE order_date >= '2024-01-01' AND order_date <= '2024-12-31'"
    );
    res.json(totalSales.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/get/categories", jwtAuthorize, async (req, res) => {
  try {
    const query = `SELECT * FROM categories`;
    const categories = await pool.query(query);
    return res.json(categories.rows);
  } catch (error) {
    console.error(error);
  }
});

// Manager Categories
router.get("/get/categories/:store_id", jwtAuthorize, async (req, res) => {
  try {
    const { store_id } = req.params;
    const query = `SELECT * FROM categories WHERE store_id = $1`;
    const categories = await pool.query(query, [store_id]);
    return res.json(categories.rows);
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/add/category/manager",
  upload.single("categoryImage"),
  jwtAuthorize,
  async (req, res) => {
    try {
      const { categoryName, store_id } = req.body;
      const categoryImage = req.file ? req.file.filename : null;
      console.log(categoryName, categoryImage);

      if (!categoryName) {
        return res.status(400).json({ message: "Category name is required." });
      }

      cloudinary.uploader.upload(req.file.path, async function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error",
          });
        } else {
          const query = `INSERT INTO categories (category_name, category_image, store_id) VALUES ($1, $2, $3) RETURNING *`;
          const newCategory = await pool.query(query, [
            categoryName,
            result.url,
            store_id,
          ]);

          return res.json(newCategory.rows[0]);
        }
      });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({ message: "Error adding category" });
    }
  }
);

router.get("/get/store_name", jwtAuthorize, async (req, res) => {
  try {
    const query = `SELECT * FROM store_location`;
    const store_name = await pool.query(query);
    return res.json(store_name.rows);
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/add/product",
  jwtAuthorize,
  upload.single("product_image"),
  async (req, res) => {
    try {
      const { product_name, product_price, category_id, product_type } =
        req.body;
      console.log(category_id);
      cloudinary.uploader.upload(req.file.path, async function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error",
          });
        } else {
          // SQL query to insert product into the database
          const query = `
            INSERT INTO products (product_name, product_price, category_id, product_image, product_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

          // Execute the query to insert the product
          const newProduct = await pool.query(query, [
            product_name,
            product_price,
            category_id, // Use category_id from the body, default to 1 if not provided
            result.url, // Store the path to the uploaded image
            product_type,
          ]);

          return res.json(newProduct.rows[0]);
        }
      });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ message: "Error adding product" });
    }
  }
);

router.post(
  "/add/category",
  jwtAuthorize,
  upload.single("categoryImage"),
  async (req, res) => {
    try {
      const { categoryName } = req.body;
      const categoryImage = req.file ? req.file.filename : null;
      console.log(categoryName, categoryImage);

      if (!categoryName) {
        return res.status(400).json({ message: "Category name is required." });
      }

      cloudinary.uploader.upload(req.file.path, async function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error",
          });
        } else {
          const query = `INSERT INTO categories (category_name, category_image) VALUES ($1, $2) RETURNING *`;
          const newCategory = await pool.query(query, [
            categoryName,
            result.url,
          ]);

          return res.json(newCategory.rows[0]);
        }
      });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({ message: "Error adding category" });
    }
  }
);

router.patch(
  "/update/category/:category_id",
  jwtAuthorize,
  async (req, res) => {
    try {
      const { category_id } = req.params;
      const { category_name } = req.body;

      // Validate input (optional but recommended)
      if (!category_name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      // Update the category in the database
      const query = `
            UPDATE categories 
            SET category_name = $1 
            WHERE category_id = $2 
            RETURNING *`;

      const updatedCategory = await pool.query(query, [
        category_name,
        category_id,
      ]);

      // Check if category exists
      if (updatedCategory.rows.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.json(updatedCategory.rows[0]);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Error updating category" });
    }
  }
);

router.patch(
  "/update/delete/category/:category_id",
  jwtAuthorize,
  async (req, res) => {
    try {
      const { category_id } = req.params;
      const { status } = req.body;

      // Validate input (optional but recommended)
      if (!category_id) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      // Update the category in the database
      const query = `
            UPDATE categories 
            SET status = $1 
            WHERE category_id = $2 
            RETURNING *`;

      const updatedCategory = await pool.query(query, [status, category_id]);

      // Check if category exists
      if (updatedCategory.rows.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.json(updatedCategory.rows[0]);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Error updating category" });
    }
  }
);

router.put(
  "/update/product/:product_id",
  jwtAuthorize,
  upload.single("product_image"), // Handle single file upload
  async (req, res) => {
    const { product_id } = req.params;
    const { product_name, product_price, category_id } = req.body;
    const product_image = req.file?.filename; // File will be undefined if no new image is uploaded

    try {
      // Check if the product exists
      const checkQuery = `SELECT * FROM products WHERE product_id = $1`;
      const checkProduct = await pool.query(checkQuery, [product_id]);

      if (checkProduct.rowCount === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update query for the product
      cloudinary.uploader.upload(req.file.path, async function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error",
          });
        } else {
          const query = `
                UPDATE products
                SET 
                    product_name = $1, 
                    product_price = $2, 
                    category_id = $3, 
                    product_image = COALESCE($4, product_image)
                WHERE product_id = $5
                RETURNING *;
            `;

          // Execute the update query
          const updatedProduct = await pool.query(query, [
            product_name,
            product_price,
            category_id,
            result.url,
            product_id,
          ]);

          return res.json({
            message: "Product updated successfully",
            product: updatedProduct.rows[0],
          });
        }
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product" });
    }
  }
);

module.exports = router;
