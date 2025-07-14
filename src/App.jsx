import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManageEnterprise from "./pages/admin/AdminManageEnterprise";
import AdminManageAccount from "./pages/admin/AdminManageAccount";
import AdminManageWarehouse from "./pages/admin/AdminManageWarehouse";

// Staff
import StaffDashboard from "./pages/staff/StaffDashboard";
import ImportOrderProcess from "./pages/staff/ImportOrderProcess";
import ImportsList from "./pages/staff/ImportsList";
import CreateImport from "./pages/staff/CreateImport";
import StaffInventory from "./pages/staff/StaffInventory";
import ActivityLogs from "./pages/staff/ActivityLogs";
import StaffLayout from "./layouts/StaffLayout";

// Products
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import ProtectedRoute from "./auth/ProtectedRoute";

import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";

import UserLayout from "./layouts/MainLayout";
import WarehousesDB from "./pages/manager/WarehousesDB";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerLayout from "./layouts/ManagerLayout";
import WarehouseDetail from "./pages/manager/WarehouseDetail";
import ShipperLayout from "./layouts/ShipperLayout";
import ShipperDashboard from "./pages/shipper/ShipperDashboard";
import ShipmentDetail from "./pages/shipper/ShipmentDetail";
import CompletedDeliveries from "./components/shipper/CompletedDeliveries";
import DeliveryHistory from "./components/shipper/DelivaryHistory";
import AvailableOrders from "./components/shipper/AvailableOrders";
import InTransitShipments from "./components/shipper/InTransitShipments";
import WarehousemanLayout from "./layouts/WarehousemanLayout";
import WarehousemanDashboard from "./pages/warehouseman/WarehousemanDashboard";
import ImportProducts from "./pages/warehouseman/ImportProducts";
// import Cart from "./pages/Cart";
// import CreateOrder from "./pages/CreateOrder";
// import OrderTracking from "./pages/OrderTracking";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth">
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Chuyển "/" về "/products" */}
        {/* <Route path="/" element={<Navigate to="/products" replace />} /> */}
        <Route element={<UserLayout />}>
          <Route index element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} /> 

          {/* Unauthenticated Routes */}
          {/* route public mà không cần đăng nhập */}
          <Route path="/public">
            <Route index element={<ProductList />} />
            <Route path="products" element={<ProductList />} />
             <Route path="product/:id" element={<ProductDetail />} /> 
            {/* ... ném các route tương tự mà không cần đăng nhập vẫn xem được vào đây */}
          </Route>

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
          <Route
            path="/staff"
            element={
              <ProtectedRoute
                requiredRoles={["admin", "manager", "staff", "shipper"]}
              />
            }
          >
            {/* route mà cần user phải có roles ADMIN/manager/... thả vào đây */}
          </Route>

          <Route path="/shipper" element={<ProtectedRoute requiredRoles={["shipper"]} />}>
            <Route element={<ShipperLayout />}>
              <Route index element={<ShipperDashboard />} />
              <Route path="shipment/:id" element={<ShipmentDetail />} />
              <Route path="available-orders" element={<AvailableOrders />} />
              <Route path="in-transit" element={<InTransitShipments />} />
              <Route path="completed" element={<CompletedDeliveries />} />
              <Route path="history" element={<DeliveryHistory />} />
            </Route>
          </Route>

          {/* Staff Routes */}
          <Route
            path="/staff"
            element={<ProtectedRoute requiredRoles={["staff"]} />}
          >
            <Route element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route
                path="import-order/:orderId"
                element={<ImportOrderProcess />}
              />
              <Route path="imports" element={<ImportsList />} />
              <Route path="create-import" element={<CreateImport />} />
              <Route path="inventory" element={<StaffInventory />} />
              <Route path="logs" element={<ActivityLogs />} />
            </Route>
          </Route>

          {/* làm tương tự cho các route cần role khác */}
          <Route
            path="/manager"
            element={<ProtectedRoute requiredRoles={["manager"]} />}
          >
            <Route element={<ManagerLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="warehouse" element={<WarehousesDB />} />
              <Route
                path="warehouse/:warehouseId"
                element={<WarehouseDetail />}
              />
            </Route>
          </Route>
          <Route
            path="/warehouseman"
            element={<ProtectedRoute requiredRoles={["warehouseman"]} />}
          >
            <Route element={<WarehousemanLayout />}>
              <Route index element={<WarehousemanDashboard />} />
              <Route path="import" element={<ImportProducts />} />
            </Route>
          </Route>
        </Route>
        {/* Routes that requires user to have role ABC */}
        <Route
          path="/admin"
          element={<ProtectedRoute requiredRoles={["admin"]} />}
        >
          {/* route mà cần user phải có role ADMIN thả vào đây */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-account" element={<AdminManageAccount />} />
          <Route path="manage-enterprise" element={<AdminManageEnterprise />} />
          <Route path="manage-warehouse" element={<AdminManageWarehouse />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
