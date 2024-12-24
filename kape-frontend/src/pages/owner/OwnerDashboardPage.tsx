import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/view/Sidebar";
import {
  getAverageSales2024,
  getMonthlySales2024,
  getStoreSales2024,
  getTop5LeastSaleProducts,
  getTop5MostSaleProducts,
  getTotalSales2024,
} from "../../services/orders.service";
import Recommendation from "../../components/view/Recommendation";
import { authUser } from "../../services/auth.service";

interface MonthlySales2024 {
  month: string;
  sum: number;
}

interface StoreSales2024 {
  store_name: string;
  sales: number;
}

interface Top5MostSaleProducts {
  product_name: string;
  sales: number;
}

interface Least5SaleProducts {
  product_name: string;
  sales: number;
}

const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const [top5LeastSaleProducts, setLeastProducts] = useState<
    Least5SaleProducts[]
  >([]);
  const [monthlySales2024, setMonthlySales2024] = useState<MonthlySales2024[]>(
    []
  );
  const [storeSales2024, setStoreSales2024] = useState<StoreSales2024[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [averageSales, setAverageSales2024] = useState(0);
  const [top5MostSaleProducts, setTop5MostSaleProducts] = useState<
    Top5MostSaleProducts[]
  >([]);

  useEffect(() => {
    const verifyUser = async () => {
      const isVerified = await authUser();
      console.log(isVerified);
      if (!isVerified) {
        navigate("/admin/login");
      }
    };

    verifyUser();
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const topLeastProductSales = await getTop5LeastSaleProducts();
    const topMostSaleProducts = await getTop5MostSaleProducts();
    const totalSales = await getTotalSales2024();
    const monthlySales = await getMonthlySales2024();
    const storeSales2024 = await getStoreSales2024();
    const averageSales2024 = await getAverageSales2024();
    const sales = totalSales;

    setLeastProducts(topLeastProductSales as Least5SaleProducts[]);
    setTop5MostSaleProducts(topMostSaleProducts as Top5MostSaleProducts[]);
    setMonthlySales2024(monthlySales as MonthlySales2024[]);
    setStoreSales2024(storeSales2024 as StoreSales2024[]);
    setTotalSales(sales[0].sum);
    setAverageSales2024(averageSales2024[0].avg);
  };
  console.log(monthlySales2024.find((item) => item.month === "2")?.sum);

  return (
    <section className="dashboard flex h-screen">
      <Sidebar />
      <main className="main__container h-full w-4/5 overflow-auto">
        {localStorage.getItem("role") === "owner" && (
          <iframe
            width="100%"
            height="1910"
            src="https://lookerstudio.google.com/embed/reporting/15f19cd5-6041-4fab-b4af-e1b630eeb380/page/p_f7fr50qjnd"
            style={{
              border: 0,
            }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        )}
        {localStorage.getItem("role") == "owner" && (
          <div className="flex">
            <Recommendation
              monthly_sale={monthlySales2024}
              total_sales={totalSales}
              store_sale={storeSales2024}
              average_sale={averageSales}
              top_5_products={top5MostSaleProducts}
              low_5_products={top5LeastSaleProducts}
            />
          </div>
        )}
      </main>
    </section>
  );
};

export default OwnerDashboardPage;
