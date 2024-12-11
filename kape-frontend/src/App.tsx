import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/customer/HomePage";
import LoginPage from "./pages/admin/LoginPage";
import ProductsPage from "./pages/admin/ProductsPage";
import StorePage from "./pages/admin/StorePage";
import OrderPage from "./pages/admin/OrderPage";
import PromoPage from "./pages/admin/PromoPage";
import MenuPage from "./pages/customer/MenuPage";
import PromotionPage from "./pages/customer/PromotionPage";
import Storesapge from "./pages/customer/Storesapge";
import SamplePage from "./pages/customer/SamplePage";
import CategoriesPage from "./pages/admin/CategoryPage";
import OwnerPage from "./pages/admin/OwnerPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import OwnerCategoriesPage from "./pages/owner/OwnerCategoryPage";
import OwnerProductsPage from "./pages/owner/OwnerProductsPage";
import AdminManagerPage from "./pages/admin/AdminManagerPage";
import OwnerManagerPage from "./pages/owner/OwnerManagerPage";
import OwnerStorePage from "./pages/owner/OwnerStorePage";
import OwnerPromoPage from "./pages/owner/OwnerPromoPage";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import ManagerCategoriesPage from "./pages/manager/ManagerCategoryPage";
import ManagerProductsPage from "./pages/manager/ManagerProductsPage";
import ManagerOrderPage from "./pages/manager/ManagerOrderPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect from / to /home */}
                <Route path="/" element={<Navigate to="/home" />} />

                {/* Other routes */}
                <Route element={<HomePage />} path="/home" />
                <Route element={<MenuPage />} path="/menu" />

                {/* Owner Pages */}
                <Route element={<OwnerCategoriesPage />} path="/categories-owner" />
                <Route element={<OwnerProductsPage />} path="/products-owner" />
                <Route element={<OwnerDashboardPage />} path="/dashboard" />
                <Route element={<OwnerManagerPage />} path="/managers-owner" />
                <Route element={<OwnerStorePage />} path="/stores-owner" />
                <Route element={<OwnerPromoPage />} path="/promos-owner" />

                {/* Manager Pages */}
                <Route element={<ManagerDashboardPage />} path="/dashboard-manager" />
                <Route element={<ManagerCategoriesPage />} path="/categories-manager" />
                <Route element={<ManagerProductsPage />} path="/products-manager" />
                <Route element={<ManagerOrderPage />} path="/orders-manager" />

                {/* Admin Pages */}

                <Route element={<AdminManagerPage />} path="/managers-admin" />
                <Route element={<ProductsPage />} path="/products" />
                <Route element={<StorePage />} path="/stores" />
                <Route element={<OrderPage />} path="/orders" />
                <Route element={<LoginPage />} path="/admin/login" />
                <Route element={<PromoPage />} path="/promos" />
                <Route element={<PromotionPage />} path="/promotions" />
                <Route element={<Storesapge />} path="/store-locations" />
                <Route element={<SamplePage />} path="/sample-page" />
                <Route element={<CategoriesPage />} path="/categories" />
                <Route element={<OwnerPage />} path="/owners" />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
