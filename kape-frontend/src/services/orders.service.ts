const SERVER_URI = "https://coffee-beer-cafe.onrender.com/api";

// Function to retrieve the token from local storage
const getToken = () => localStorage.getItem("token"); // Adjust based on your token storage method

export const getPreviousMonthOrders = async () => {
  const token = getToken(); // Assuming you have a function to get JWT token

  try {
    // Get the current date
    const currentDate = new Date();

    // Calculate the previous month
    let previousMonth = currentDate.getMonth(); // 0-based index (0 = January, 11 = December)
    let previousYear = currentDate.getFullYear(); // Current year

    // If the current month is January (0), set the previous month to December (11) of the previous year
    if (previousMonth === 0) {
      previousMonth = 11; // December
      previousYear -= 1; // Previous year
    }

    // Format the previous month and year

    console.log(
      "Previous month: ${previousMonthFormatted}, Year: ${previousYear}"
    );

    // Construct query parameters

    // Send the GET request to fetch data for the previous month
    const response = await fetch(
      "${SERVER_URI}/get/specific-orders?${queryParams}",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );

    // Check if the response is successful
    if (!response.ok) {
      throw new Error("Error: ${response.status} - ${response.statusText}");
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error("Error fetching previous month orders:", error);
    throw error;
  }
};

export const addOrder = async (orders: any) => {
  const token = getToken();

  console.log(orders, "asdasdasdas");
  try {
    const response = await fetch(`${SERVER_URI}/add/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify the content type
        ...(token ? { jwt_token: token } : {}), // Conditionally add the token if it exists
      },
      body: JSON.stringify(orders), // Convert orders object to JSON string
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    await addOrderList(data.order_id, orders.orderlist);
  } catch (error) {
    console.error("Error adding order:", error);
    throw error;
  }
};

const addOrderList = async (order_id: any, order_list: any) => {
  const token = getToken();

  try {
    // Combine order_id with each item in the order_list
    const formattedOrderList = order_list.map((item: any) => ({
      ...item, // Spread the existing properties of the item
      order_id, // Add the order_id to each item
    }));

    console.log(order_list, "Asdasd");

    // Use Promise.all to send all fetch requests
    const responses = await Promise.all(
      formattedOrderList.map(async (orderItem: any) => {
        const response = await fetch(`${SERVER_URI}/add/order-list`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { jwt_token: token } : {}),
          },
          body: JSON.stringify(orderItem), // Send each item individually
        });

        // Check if the response is ok
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        return await response.json(); // Return the parsed response data
      })
    );

    // Here you can return all the responses or process them further
    return responses; // Return all response data from the requests
  } catch (error) {
    console.error("Error adding order:", error);
    throw error;
  }
};

export const getOrders = async () => {
  const token = getToken();

  try {
    const response = await fetch(`${SERVER_URI}/get/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { jwt_token: token } : {}),
      },
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders list:", error);
    throw error;
  }
};

export const getSpecificOrders = async (year: string, storeId: string) => {
  const token = getToken();

  try {
    // Construct query parameters based on year and storeId
    const queryParams = new URLSearchParams({
      year,
      store_id: storeId,
    }).toString();

    const response = await fetch(
      `${SERVER_URI}/get/specific-orders?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders list:", error);
    throw error;
  }
};

export const getTopSoldProducts = async () => {
  try {
    // Make the GET request to the server
    const response = await fetch(`${SERVER_URI}/get/top-sold-products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error("Error fetching top sold products:", error);
    throw error;
  }
};

export const getTopSoldProductsNoLimint = async (
  year: string,
  store_id: string
) => {
  try {
    const token = getToken();

    // Make the GET request to the server
    const response = await fetch(
      `${SERVER_URI}/get/top-sold-products-no-limit/${year}/${store_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error("Error fetching top sold products:", error);
    throw error;
  }
};

export const getPeakHours = async (year: string, store_id: string) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/peak-hours/${year}/${store_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders list:", error);
    throw error;
  }
};

export const getOrderList = async (order_id: number) => {
  const token = getToken();
  console.log(order_id);
  try {
    const response = await fetch(`${SERVER_URI}/get/order-list/${order_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { jwt_token: token } : {}),
      },
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders list:", error);
    throw error;
  }
};

export const getTotalSales2024 = async () => {
  const token = getToken();
  try {
    const response = await fetch(`${SERVER_URI}/get/products/total-sales`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { jwt_token: token } : {}),
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getMonthlySales2024 = async () => {
  const token = getToken();
  try {
    const response = await fetch(`${SERVER_URI}/get/owner/monthly-sales`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { jwt_token: token } : {}),
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getStoreSales2024 = async () => {
  const token = getToken();
  try {
    const response = await fetch(`${SERVER_URI}/get/owner/store-sales`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { jwt_token: token } : {}),
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const store_sales = await response.json();
    return store_sales;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getAverageSales2024 = async () => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/owner/average-order-sales`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const average_sales = await response.json();
    return average_sales;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getTop5MostSaleProducts = async () => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/owner/top-5-products-with-most-sales`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const top_5_products = await response.json();
    return top_5_products;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getTop5LeastSaleProducts = async () => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/owner/top-5-products-with-least-sales`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const low_5_products = await response.json();
    return low_5_products;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getTotalSales2024Manager = async (store_id: number) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/manager/store-sales/${store_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const total = await response.json();
    return total;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getMonthlySales2024Manager = async (store_id: number) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/manager/monthly-sales/${store_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getStoreSales2024Manager = async (store_id: number) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/manager/store-sales/${store_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const store_sales = await response.json();
    return store_sales;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getAverageSales2024Manager = async (store_id: number) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/manager/average-order-sales/${store_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const average_sales = await response.json();
    return average_sales;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getTop5MostSaleProductsManager = async (store_id: number) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/manager/top-5-products-with-most-sales/${store_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const top_5_products = await response.json();
    return top_5_products;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getTop5LeastSaleProductsManager = async (store_id: number) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${SERVER_URI}/get/manager/top-5-products-with-least-sales/${store_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { jwt_token: token } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const low_5_products = await response.json();
    return low_5_products;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
