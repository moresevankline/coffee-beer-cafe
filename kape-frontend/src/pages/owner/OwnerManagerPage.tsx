import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import Sidebar from "../../components/Sidebar";
import { createColumnHelper } from "@tanstack/react-table";
import { getManagers } from "../../services/users.service";
import { useNavigate } from "react-router-dom";

// Define the User interface
interface User {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    store_name: string;
}

const columnHelper = createColumnHelper<User>();

const OwnerManagerPage = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [reload, setReload] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // Search query state;

    const columns = [
        columnHelper.accessor("first_name", {
            cell: (info) => <p>{info.getValue()}</p>,
            header: () => <span>First Name</span>,
        }),
        columnHelper.accessor("last_name", {
            cell: (info) => <p>{info.getValue()}</p>,
            header: () => <span>Last Name</span>,
        }),
        columnHelper.accessor("email", {
            header: "Email",
            cell: (info) => <p>{info.renderValue()}</p>,
        }),
        columnHelper.accessor("store_name", {
            cell: (info) => <p>{info.getValue()}</p>,
            header: () => <span>Store</span>,
        }),
    ].filter(Boolean); // Filter out any `false` values to avoid extra columns

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/admin/login");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const managers = await getManagers();
                console.log(managers);
                const transformedManagers = managers.map((manager: any) => ({
                    user_id: manager.user_id,
                    first_name: manager.first_name,
                    last_name: manager.last_name,
                    email: manager.email,
                    store_name: manager.store_name,
                }));

                setUsers(transformedManagers);
                setReload(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchManagers();
    }, [reload]);

    // Filter users based on search query
    const filteredUsers = users.filter(
        (user) =>
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="manager h-screen flex">
            <Sidebar />
            <main className="main__container h-full w-4/5 p-5 overflow-auto">
                <div className="main__header flex justify-between items-center">
                    <h1 className="main__title text-3xl uppercase">Managers</h1>
                </div>
                <div className="my-3">
                    <input
                        type="text"
                        placeholder="Search by name or email"
                        className="input input-bordered w-full max-w-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <hr className="border border-amber-600 my-3" />
                <div className="main__table__container">
                    <DataTable data={filteredUsers} columns={columns} />
                </div>
            </main>
        </section>
    );
};

export default OwnerManagerPage;
