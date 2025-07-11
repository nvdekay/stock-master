import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import ProtectedRoute from "./auth/ProtectedRoute";

import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";

import UserLayout from "./layouts/MainLayout";
import WarehousesDB from "./pages/manager/WarehousesDB";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerLayout from "./layouts/ManagerLayout";
import ShipperLayout from "./layouts/ShipperLayout";
import ShipperDashboard from "./pages/shipper/ShipperDashboard";
import ShipmentDetail from "./pages/shipper/ShipmentDetail";
import CompletedDeliveries from "./components/shipper/CompletedDeliveries";
import DeliveryHistory from "./components/shipper/DelivaryHistory";
// import Cart from "./pages/Cart";
// import CreateOrder from "./pages/CreateOrder";
// import OrderTracking from "./pages/OrderTracking";

function App() {
  return (
    <Router>
      <Routes>
        {/* Unauthenticated Routes */}
        <Route path="/auth" >
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

        </Route>


        {/* Chuyển "/" về "/products" */}
        {/* <Route path="/" element={<Navigate to="/products" replace />} /> */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<ProductList />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />
          {/* <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<CreateOrder />} />
        <Route path="/orders" element={<OrderTracking />} /> */}


          {/* Authenticated Routes */}

          {/* Routes that requires user to log in */}
          <Route path="/authenticated" element={<ProtectedRoute />}>
            {/* route mà cần user đã đăng nhập mới truy cập được thì thả vào đây */}

          </Route>

          {/* Nếu trang liến quan đến quản lí mà
           cùng 1 trang hiển thị các chức năng khác nhau cho mỗi role riêng 
           thì chỉ cần ném nó vào mục này
        */}
          <Route path="/staff" element={<ProtectedRoute requiredRoles={["admin", "manager", "staff", "shipper"]} />}>
            {/* route mà cần user phải có roles ADMIN/manager/... thả vào đây */}

          </Route>

          <Route path="/shipper" element={<ShipperLayout />}>
            <Route index element={<ShipperDashboard />} />
            <Route path="shipment/:id" element={<ShipmentDetail />} />
            <Route path="completed" element={<CompletedDeliveries />} />
            <Route path="history" element={<DeliveryHistory />} />
          </Route>

          {/* làm tương tự cho các route cần role khác */}
          <Route path="/manager" element={<ProtectedRoute requiredRoles={["manager"]} />}>
            <Route element={<ManagerLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="warehouse" element={<WarehousesDB />} />
              {/* Thêm các route manager khác vào đây */}
            </Route>
          </Route>

        </Route>
        {/* Routes that requires user to have role ABC */}
        <Route path="/admin" element={<ProtectedRoute requiredRoles={["admin"]} />}>
          {/* route mà cần user phải có role ADMIN thả vào đây */}
          <Route index element={<AdminDashboard />} />

        </Route>


      </Routes>
    </Router>
  );
}

export default App;
