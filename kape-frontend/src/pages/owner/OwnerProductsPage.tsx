import { useEffect, useState } from "react";
import DataTable from "../../components/view/DataTable";
import Sidebar from "../../components/view/Sidebar";
import { createColumnHelper } from "@tanstack/react-table";
import {
  getCategories,
  getProductsWithCategories,
} from "../../services/products.service";
import { useNavigate } from "react-router-dom";

const columnHelper = createColumnHelper();

const OwnerProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reload, setReload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const columns = [
    columnHelper.accessor("product_image", {
      cell: (info: any) => (
        <img alt="Product" src={info.getValue()} className="w-[10rem]" />
      ),
      header: () => <span>Image</span>,
    }),
    columnHelper.accessor("product_name", {
      cell: (info) => <p>{info.getValue()}</p>,
      header: () => <span>Product Name</span>,
    }),
    columnHelper.accessor("product_price", {
      cell: (info) => <p>Php {info.getValue()}</p>,
      header: () => <span>Price</span>,
    }),
    columnHelper.accessor("category_name", {
      cell: (info) => <p>{info.getValue()}</p>,
      header: () => <span>Category</span>,
    }),
  ].filter(Boolean);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/admin/login");
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProductsWithCategories();
        setProducts(productsData);
        setReload(false);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();

        const activeCategories = categoriesData.filter(
          (category: any) => category.status === "active"
        );
        setCategories(activeCategories);
        setReload(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [reload]);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (product: any) => product.category_id === Number(selectedCategory)
        );

  return (
    <section className="products h-screen flex">
      <Sidebar />
      <main className="main__container h-full w-4/5 p-5 overflow-auto">
        <div className="main__header flex justify-between items-center">
          <h1 className="main__title text-3xl uppercase">Products</h1>
        </div>
        <hr className="border border-amber-600 my-3" />
        <div className="main__table__container">
          <div className="table__controls mb-4">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Pick a category</span>
              </div>
              <select
                className="select select-bordered"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All</option>
                {categories.map((category: any) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DataTable data={filteredProducts} columns={columns} />
        </div>
      </main>
    </section>
  );
};

export default OwnerProductsPage;
