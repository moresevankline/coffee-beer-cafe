import { useEffect, useState } from "react";
import DataTable from "../../components/view/DataTable";
import Sidebar from "../../components/view/Sidebar";
import { createColumnHelper } from "@tanstack/react-table";
import { getStoreLocations } from "../../services/stores.service";
import { useNavigate } from "react-router-dom";

// Define the Store interface
interface Store {
  store_name: string;
  address: string;
  latitude: string;
  longitude: string;
  store_id: string; // Add an id to each store for identification
}

// Create a column helper for the Store type
const columnHelper = createColumnHelper<Store>();

const OwnerStorePage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [reload, setReload] = useState(false);
  const columns = [
    columnHelper.accessor("store_name", {
      cell: (info) => <p>{info.getValue()}</p>,
      header: () => <span>Store Name</span>,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor("address", {
      cell: (info) => <p>{info.getValue()}</p>,
      header: () => <span>Address</span>,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor("latitude", {
      header: () => "Latitude",
      cell: (info) => <p>{info.renderValue()}</p>,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor("longitude", {
      header: () => "Longitude",
      cell: (info) => <p>{info.renderValue()}</p>,
      footer: (info) => info.column.id,
    }),
  ].filter(Boolean);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if no token is found
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const stores = await getStoreLocations(); // Assuming this function fetches store locations
        setStores(stores);
        setReload(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStores();
  }, [reload]);

  return (
    <section className="store h-screen flex">
      <Sidebar />
      <main className="main__container h-full w-4/5 p-5 overflow-auto">
        <hr className="border border-amber-600 my-3" />
        <div className="main__table__container">
          <DataTable data={stores} columns={columns} />
        </div>
      </main>
    </section>
  );
};

export default OwnerStorePage;
