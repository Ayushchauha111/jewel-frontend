import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import StockManagement from "./components/admin/StockManagement";
import BillingManagement from "./components/admin/BillingManagement";
import CustomerManagement from "./components/admin/CustomerManagement";
import OrderManagement from "./components/admin/OrderManagement";
import CreditManagement from "./components/admin/CreditManagement";
import RatesManagement from "./components/admin/RatesManagement";
import AnalyticsDashboard from "./components/admin/AnalyticsDashboard";
import IncomeExpenseManagement from "./components/admin/IncomeExpenseManagement";
import RateLimitManagement from "./components/admin/RateLimitManagement";
import QRCodePrint from "./components/admin/QRCodePrint";

// Customer Website Components
import CustomerHome from "./components/customer/CustomerHome";
import ProductCatalog from "./components/customer/ProductCatalog";
import Checkout from "./components/customer/Checkout";
import OrderStatus from "./components/customer/OrderStatus";
import LiveRates from "./components/customer/LiveRates";
import GoldMine from "./components/customer/GoldMine";
import GoldReserve from "./components/customer/GoldReserve";

// Auth Components
import Login from "./components/user/login.component";
import Register from "./components/user/register.component";

function App() {
  return (
        <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Website Routes */}
          <Route path="/" element={<CustomerHome />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/live-rates" element={<LiveRates />} />
          <Route path="/gold-mine" element={<GoldMine />} />
          <Route path="/gold-reserve" element={<GoldReserve />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderStatus />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/stock" element={<StockManagement />} />
          <Route path="/admin/qr-print" element={<QRCodePrint />} />
          <Route path="/admin/billing" element={<BillingManagement />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/credits" element={<CreditManagement />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/income-expense" element={<IncomeExpenseManagement />} />
          <Route path="/admin/rates" element={<RatesManagement />} />
          <Route path="/admin/rate-limit" element={<RateLimitManagement />} />
          </Routes>
      </BrowserRouter>
        </HelmetProvider>
  );
}

export default App;
