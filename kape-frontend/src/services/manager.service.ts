const SERVER_URI = "https://coffee-beer-cafe.onrender.com/api";

// Function to retrieve the token from local storage
const getToken = () => localStorage.getItem("token"); // Adjust based on your token storage method

// Manager Data
export const getCategoriesManager = async (store_id: number) => {
  const token = getToken();
  try {
    const response = await fetch(`${SERVER_URI}/get/categories/${store_id}`, {
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

export const addCategoryManager = async (
  categoryName: string,
  categoryImage: File,
  store_id: number
) => {
  const token = getToken();
  try {
    // Create a FormData object to hold the data
    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("categoryImage", categoryImage);
    formData.append("store_id", store_id.toString());

    const response = await fetch(`${SERVER_URI}/add/category/manager`, {
      method: "POST",
      headers: {
        ...(token ? { jwt_token: token } : {}), // Include the JWT token if available
      },
      body: formData, // Send the FormData object as the request body
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const categoryAdded = await response.json();
    return categoryAdded.category_id;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const getProductsWithCategoriesManager = async (store_id: number) => {
  const token = getToken();

  try {
    const response = await fetch(
      `${SERVER_URI}/get/products/manager/${store_id}`,
      {
        method: "GET", // Specify the HTTP method
        headers: {
          "Content-Type": "application/json", // Specify the content type
          ...(token ? { jwt_token: token } : {}), // Conditionally add the token if it exists
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const managers = await response.json(); // Parse the JSON response
    return managers; // Return the list of managers
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw error; // Propagate the error for further handling if needed
  }
};

export const getOrdersManager = async (store_id: number) => {
  const token = getToken();

  try {
    const response = await fetch(`${SERVER_URI}/get/orders/${store_id}`, {
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
