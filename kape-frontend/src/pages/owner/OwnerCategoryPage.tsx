import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import Sidebar from "../../components/Sidebar";
import { createColumnHelper } from "@tanstack/react-table";
import {
    getCategories,
} from "../../services/products.service"; // Ensure deleteCategory is imported
import { useNavigate } from "react-router-dom";
import AddCategoryModal from "../../components/AddCategoryModal";
import UpdateCategoryModal from "../../components/UpdateCategoryModal";

const columnHelper = createColumnHelper();

const OwnerCategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [reload, setReload] = useState(false);

    const columns = [
        columnHelper.accessor("category_image", {
            cell: (info) => <img className="w-[18rem]" src={info.getValue()} />,
            header: () => <span>Image</span>,
        }),
        columnHelper.accessor("category_name", {
            cell: (info) => <p>{info.getValue()}</p>,
            header: () => <span>Category Name</span>,
        }),
    ].filter(Boolean);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/admin/login");
    }, [navigate]);

    useEffect(() => {
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

        fetchCategories();
    }, [reload]);



    return (
        <section className="categories h-screen flex">
            <Sidebar />
            <main className="main__container h-full w-4/5 p-5 overflow-auto">
                <div className="main__header flex justify-between items-center">
                    <h1 className="main__title text-3xl uppercase">
                        Categories
                    </h1>
                </div>
                <hr className="border border-amber-600 my-3" />
                <div className="main__table__container">
                    <DataTable data={categories} columns={columns} />
                </div>
            </main>
        </section>
    );
};

export default OwnerCategoriesPage;
