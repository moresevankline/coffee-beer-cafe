import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUsers,
  faBoxOpen,
  faShoppingCart,
  faStore,
  faTag,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo/logo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token
    navigate("/admin/login"); // Redirect to login page
  };

  return (
    <aside className="bg-amber-600 w-1/5 h-full relative">
      <div className="container p-4">
        <img src={logo} className="w-full" />
        <hr className="border border-white my-4" />

        <h3 className="text-white text-bold">
          Welcome,{" "}
          <span className="uppercase">{localStorage.getItem("role")}</span>
        </h3>
        <hr className="border border-white mt-4" />

        <ul className="flex flex-col h-full w-full space-y-2">
          {[
            // Dashboard Pages Path
            {
              path: "/dashboard",
              name: "Dashboard",
              icon: faTachometerAlt,
            },
            {
              path: "/dashboard-manager",
              name: "Dashboard",
              icon: faTachometerAlt,
            },
            // Categories Pages Path
            { path: "/categories", name: "Categories", icon: faBoxOpen },
            { path: "/categories-owner", name: "Categories", icon: faBoxOpen },
            {
              path: "/categories-manager",
              name: "Categories",
              icon: faBoxOpen,
            },

            // Products Pages Path
            {
              path: "/products-owner",
              name: "Products",
              icon: faBoxOpen,
            },
            {
              path: "/products-manager",
              name: "Products",
              icon: faBoxOpen,
            },
            {
              path: "/products",
              name: "Products",
              icon: faBoxOpen,
            },

            // Admin Pages Path
            { path: "/managers-admin", name: "Managers", icon: faUsers },
            { path: "/owners", name: "Owners", icon: faUsers },
            { path: "/stores", name: "Stores", icon: faStore },

            // Orders Page Path

            {
              path: "/orders",
              name: "Orders",
              icon: faShoppingCart,
            },
            {
              path: "/orders-manager",
              name: "Orders",
              icon: faShoppingCart,
            },

            { path: "/managers", name: "Managers", icon: faUsers },
            { path: "/managers-owner", name: "Managers", icon: faUsers },
            { path: "/stores-owner", name: "Stores", icon: faStore },
            { path: "/promos", name: "Promos", icon: faTag },
            { path: "/promos-owner", name: "Promos", icon: faTag },

            // Manager Pages Path
          ]
            .filter((item: any) => {
              const role = localStorage.getItem("role");
              if (role === "owner") {
                return [
                  "/dashboard",
                  "/products-owner",
                  "/managers-owner",
                  "/stores-owner",
                ].includes(item.path);
              }
              if (role === "manager") {
                return [
                  "/orders-manager",
                  "/products-manager",
                  "/dashboard-manager",
                  "/categories-manager",
                ].includes(item.path);
              }
              if (role === "admin") {
                return ["/managers-admin", "/stores", "/owners"].includes(
                  item.path
                );
              }
              return !item.path.includes("/owners");
            })
            .map((item) => (
              <li key={item.path} className="w-full">
                <Link
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? "bg-white text-amber-600 hover:text-white"
                      : "text-white"
                  } p-2 rounded transition w-full hover:bg-amber-500 flex items-center space-x-2`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          <li>
            <button
              onClick={handleLogout}
              className="text-white hover:bg-amber-500 hover:text-white p-2 rounded transition w-full text-left flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
