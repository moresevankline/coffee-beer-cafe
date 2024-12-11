import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
  getAverageSales2024Manager,
  getMonthlySales2024Manager,
  getStoreSales2024Manager,
  getTop5LeastSaleProductsManager,
  getTop5MostSaleProductsManager,
  getTotalSales2024Manager,
} from "../../services/orders.service";
import Recommendation from "../../components/Recommendation";
import { authUser } from "../../services/auth.service";

interface MonthlySales2024 {
  month: number;
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

const ManagerDashboardPage = () => {
  const navigate = useNavigate();
  const [top5LeastSaleProducts, setLeastProducts] = useState<Least5SaleProducts[]>([]);
  const [monthlySales2024, setMonthlySales2024] = useState<MonthlySales2024[]>([]);
  const [storeSales2024, setStoreSales2024] = useState<StoreSales2024[]>([]);
  const [totalSales, setTotalSales] = useState(0); 
  const [averageSales, setAverageSales2024] = useState(0);
  const [top5MostSaleProducts, setTop5MostSaleProducts] = useState<Top5MostSaleProducts[]>([]);


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
    {let store_id = localStorage.getItem("store_id") 

    const topLeastProductSales = await getTop5LeastSaleProductsManager(Number(store_id));
    const topMostSaleProducts = await getTop5MostSaleProductsManager(Number(store_id));
    const totalSales = await getTotalSales2024Manager(Number(store_id));
    const monthlySales = await getMonthlySales2024Manager(Number(store_id));
    const storeSales2024 = await getStoreSales2024Manager(Number(store_id));
    const averageSales2024 = await getAverageSales2024Manager(Number(store_id));
    const sales = totalSales;

    setLeastProducts(topLeastProductSales as Least5SaleProducts[])
    setTop5MostSaleProducts(topMostSaleProducts as Top5MostSaleProducts[])
    setMonthlySales2024(monthlySales as MonthlySales2024[]);
    setStoreSales2024(storeSales2024 as StoreSales2024[]);
    setTotalSales(sales[0].sum);
    setAverageSales2024(averageSales2024[0].avg)}
  }

  return (
    <section className="dashboard flex h-screen">
      <Sidebar />
      <main className="main__container h-full w-4/5 overflow-auto">
        {localStorage.getItem("role") === "manager" &&
          localStorage.getItem("store_id")?.toString() === "1" && (
            <iframe
              width="100%"
              height="2200"
              src="https://lookerstudio.google.com/embed/reporting/9154a1a3-1ffa-42d9-a56e-2c9c5d4ab661/page/1K3XE"
              style={{
                border: 0,
              }}
              allowFullScreen // Correct casing
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          )}

        {localStorage.getItem("role") === "manager" &&
          localStorage.getItem("store_id")?.toString() === "2" && (
            <iframe
              width="100%"
              height="2200"
              src="https://lookerstudio.google.com/embed/reporting/f5201d0e-6539-43a3-9a7f-e96ce1c71a8d/page/OC2XE"
              style={{
                border: 0,
              }}
              allowFullScreen // Correct casing
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          )}
        {localStorage.getItem("role") === "manager" &&
          localStorage.getItem("store_id")?.toString() === "3" && (
            <iframe
              width="100%"
              height="2200"
              src="https://lookerstudio.google.com/embed/reporting/376dcb5a-69b7-4f32-9f94-6076a059793e/page/IL3XE"
              style={{
                border: 0,
              }}
              allowFullScreen // Correct casing
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          )}
        {localStorage.getItem("role") === "manager" &&
          localStorage.getItem("store_id")?.toString() === "4" && (
            <iframe
              width="100%"
              height="2200"
              src="https://lookerstudio.google.com/embed/reporting/0e1cb869-b1ad-4178-81d9-23c111483d2d/page/WL3XE"
              style={{
                border: 0,
              }}
              allowFullScreen // Correct casing
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          )}
        {localStorage.getItem("role") == "manager" && (
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

export default ManagerDashboardPage;
