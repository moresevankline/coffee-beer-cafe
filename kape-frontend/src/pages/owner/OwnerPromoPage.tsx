import { useEffect, useState } from "react";
import Sidebar from "../../components/view/Sidebar";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "../../components/view/DataTable";

interface PromoBanner {
  promo_id: number;
  promo_image: string;
  active: boolean;
  promo_title: string;
  promo_description: string;
}

const columnHelper = createColumnHelper<PromoBanner>();

const OwnerPromoPage = () => {
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([]);

  useEffect(() => {
    const fetchPromoBanners = async () => {
      try {
        const response = await fetch(
          "https://coffee-beer-cafe.onrender.com/api/get-promos"
        );
        if (!response.ok) throw new Error("Failed to fetch promo banners");
        const data: PromoBanner[] = await response.json();
        setPromoBanners(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching promo banners:", error);
      }
    };
    fetchPromoBanners();
  });

  const columns = [
    columnHelper.accessor("promo_id", {
      header: "ID",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("promo_image", {
      header: "Image",
      cell: (info) => {
        console.log(info.getValue(), "sa");
        const imageUrl = info.getValue();
        // Only perform the replacement if imageUrl is defined
        if (imageUrl) {
          return (
            <img
              src={imageUrl}
              alt="Promo Banner"
              className="w-[20rem] object-cover"
            />
          );
        }
        // If imageUrl is not defined, return a placeholder or fallback image
        return (
          <img
            src="/path/to/placeholder/image.png"
            alt="No image"
            className="w-[20rem] object-cover"
          />
        );
      },
    }),

    columnHelper.accessor("promo_title", {
      header: "Title",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("promo_description", {
      header: "Description",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("active", {
      header: "Active",
      cell: (info) => (
        <div
          className={`p-2 text-white rounded text-center text-sm ${
            info.getValue() ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {info.getValue() ? "active" : "no"}
        </div>
      ),
    }),
  ].filter(Boolean);

  return (
    <section className="manager h-screen flex">
      <Sidebar />
      <main className="main__container h-full w-4/5 p-5 overflow-auto">
        <div className="main__header flex justify-between items-center">
          <h1 className="main__title text-3xl uppercase">Promo Banners</h1>
        </div>

        <hr className="border border-amber-600 my-3" />

        <div className="main__table__container">
          <DataTable data={promoBanners} columns={columns} />
        </div>
      </main>
    </section>
  );
};

export default OwnerPromoPage;
