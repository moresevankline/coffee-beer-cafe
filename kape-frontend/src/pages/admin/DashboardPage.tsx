import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getStoreLocations } from "../../services/stores.service";
import {
  getMonthlySales2024,
  getSpecificOrders,
  getTopSoldProductsNoLimint,
  getTotalSales2024,
} from "../../services/orders.service";
import Recommendation from "../../components/Recommendation";
import {
  getProductsWithCategories,
} from "../../services/products.service";
import { authUser } from "../../services/auth.service";

interface Order {
  order_id: number;
  order_date: string;
  order_type: string;
  store_id: number;
  transaction_number: number;
  total_amount: string; 
  store_name: string;
}

interface MonthlySales2024 {
  month: number;
  sum: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]); // Stores array
  const [orders, setOrders] = useState<Order[]>([]);
  const [monthlySales2024, setMonthlySales2024] = useState<MonthlySales2024[]>([]);
  // const [saleType, setSaleType] = useState<any>({}); // Sales data by store
  const [monthlySales, setMonthlySales] = useState<number[]>([]); // Monthly sales is an array of numbers
  const [year, setYear] = useState("2024"); // Default year set to "All"
  const [salesCount, setSalesCount] = useState(0); // Total sales count
  const [productsCount, setProductsCount] = useState(0); // Total products count
  const [totalSales, setTotalSales] = useState(0); // Total sales amount
  const [store, setStore] = useState("All"); // Default store set to "All"
  const [topSold, setTopSold] = useState([]);
  const storeID: string = localStorage.getItem("store_id") || "";
  console.log(storeID);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    const verifyUser = async () => {
      const isVerified = await authUser(); // Await the authUser function
      console.log(isVerified);
      if (!isVerified) {
        navigate("/admin/login"); // Redirect if token is invalid or doesn't exist
      } else {
        const role = localStorage.getItem("role"); // Check the user's role from localStorage
        if (role === "manager") {
          setStore(storeID); // Set store from localStorage if not a manager
        } else {
          setStore("All"); // Set store to "All" if not a manager
        }
      }
    };

    verifyUser();
  }, [navigate]);

  useEffect(() => {
    // Fetch store locations and orders if the token is verified
    fetchStores();
    fetchOrders();
    fetchSold();
  }, [year, store]);

  // Fetch store locations
  const fetchStores = async () => {
    const data = await getStoreLocations();
    if (data) {
      setStores(data);
    }
  };

  const fetchSold = async () => {
    const data = await getTopSoldProductsNoLimint(year, store);
    if (data) {
      console.log("hahahaha", data);
      setTopSold(data);
    }
  };

  const fetchOrders = async () => {
    const data = await getSpecificOrders(year, store);
    const products_count = await getProductsWithCategories();
    const totalSales = await getTotalSales2024();
    const monthlySales = await getMonthlySales2024();
    const sales = totalSales;
    if (data) {
      setMonthlySales(getMonthlySales(data)); // Assuming getMonthlySales accepts Order[] as well
      // const salesData = setSalesData(data); // Updated sales data
      console.log(getMonthlySales(data), "ASd");
      console.log(data, "asd");
      console.log(calculatePercentageChanges(getMonthlySales(data)), "ASd");

      // setSaleType(salesData); // Store the sales data for further use
      setSalesCount(data.length);
      setProductsCount(products_count.length);
    }
    console.log("Monthly Sales",monthlySales);
    setMonthlySales2024(monthlySales as MonthlySales2024[]);
    setTotalSales(sales[0].sum);
    console.log("Orders",data);
  };

  // Function to calculate the percentage changes for monthly sales data
  const calculatePercentageChanges = (amounts: any) => {
    let percentages = [];
    // Start with "0%" for the first month (no previous month to compare)
    percentages.push("0");
    // Loop through the sales data and calculate the percentage change for each month
    for (let i = 1; i < amounts.length; i++) {
      const currentValue = amounts[i];
      const previousValue = amounts[i - 1];
      // Handle edge case when previous value is 0
      if (previousValue === 0) {
        if (currentValue === 0) {
          percentages.push("0"); // No change if both are 0
        } else {
          percentages.push("100"); // First increase from 0 to non-zero is 100%
        }
      } else if (currentValue === 0) {
        // Calculate the percentage decrease if the current value is 0
        const change = ((currentValue - previousValue) / previousValue) * 100;
        percentages.push(`${change.toFixed(2)}`);
      } else {
        // Normal percentage change calculation
        const change = ((currentValue - previousValue) / previousValue) * 100;
        percentages.push(`${change.toFixed(2)}`);
      }
    }

    return percentages;
  };

  // Function to update the months array with the calculated percentage changes
  const updateMonthsWithPercentage = () => {
    const updatedMonths = [];

    // Loop through the months array and append the percentage change to each month
    for (let i = 0; i < months.length; i++) {
      // Add the percentage change next to the month name
      updatedMonths.push(`${months[i]}`);
    }

    return updatedMonths;
  };

  const updateMonthsWithPercentages = () => {
    const updatedMonths = [];

    // Calculate the percentage changes for all months
    const percentageChanges = calculatePercentageChanges(monthlySales);

    // Loop through the months array and append the percentage change to each month
    for (let i = 0; i < months.length; i++) {
      // Add the percentage change next to the month name
      updatedMonths.push({
        month: months[i],
        percentage: percentageChanges[i],
      });
    }

    return updatedMonths;
  };

  const getMonthlySales = (orders: Order[]) => {
    const monthlySales = Array(12).fill(0); // Create an array to hold sales for each month (0-11)

    orders.forEach((order) => {
      const orderDate = new Date(order.order_date);
      const monthIndex = orderDate.getUTCMonth(); // Get month index (0 for January, 11 for December)
      const amount = parseFloat(order.total_amount); // Convert total_amount to a float

      monthlySales[monthIndex] += amount; // Add the amount to the corresponding month
    });

    return monthlySales;
  };


  const chartData = {
    labels: updateMonthsWithPercentage(), // Labels for months
    datasets: [
      {
        label: "Monthly Sales",
        data: monthlySales, // Monthly sales data
        backgroundColor: "rgba(61, 42, 33, 0.8)", // Bar color
        borderColor: "rgba(61, 42, 33, 1)", // Border color
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true, // Controls the legend display
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Sales", // Y-axis label
          font: {
            size: 16, // Customize the font size (optional)
          },
        },
        beginAtZero: true, // Ensures the Y-axis starts at zero
      },
    },
  };

  return (
    <section className="dashboard flex h-screen">
      <Sidebar />
      <main className="main__container h-full w-4/5 overflow-auto">
        

        {localStorage.getItem("role") === "owner" && (
          <iframe
            width="100%"
            height="1910"
            src="https://lookerstudio.google.com/embed/reporting/15f19cd5-6041-4fab-b4af-e1b630eeb380/page/p_f7fr50qjnd"
            frameBorder="0" // Correct casing
            style={{
              border: 0,
            }}
            allowFullScreen // Correct casing
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        )}

        {localStorage.getItem("role") === "manager" &&
          localStorage.getItem("store_id")?.toString() === "1" && (
            <iframe
              width="100%"
              height="2150"
              src="https://lookerstudio.google.com/embed/reporting/9154a1a3-1ffa-42d9-a56e-2c9c5d4ab661/page/1K3XE"
              frameBorder="0" // Correct casing
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
              height="2150"
              src="https://lookerstudio.google.com/embed/reporting/f5201d0e-6539-43a3-9a7f-e96ce1c71a8d/page/OC2XE"
              frameBorder="0" // Correct casing
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
              height="2150"
              src="https://lookerstudio.google.com/embed/reporting/376dcb5a-69b7-4f32-9f94-6076a059793e/page/IL3XE"
              frameBorder="0" // Correct casing
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
              height="2150"
              src="https://lookerstudio.google.com/embed/reporting/0e1cb869-b1ad-4178-81d9-23c111483d2d/page/WL3XE"
              frameBorder="0" // Correct casing
              style={{
                border: 0,
              }}
              allowFullScreen // Correct casing
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          )}
        {localStorage.getItem("role") !== "admin" && (
          <div className="flex">
            <Recommendation
              monthly_sale={monthlySales2024}
              total_sales={totalSales}
              sales_count={salesCount}
            />
          </div>
        )}
      </main>
    </section>
  );
};

export default DashboardPage;
