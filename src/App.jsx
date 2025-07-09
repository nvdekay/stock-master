import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import ProtectedRoute from "./auth/ProtectedRoute";

import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import Cart from "./pages/Cart";
import CreateImportOrder from "./pages/warehouse/CreateImportOrder";
import ImportOrdersList from "./pages/warehouse/ImportOrdersList";

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
        <Route path="/">
          <Route index element={<ProductList />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />
        </Route>

        {/* <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<CreateOrder />} />
        <Route path="/orders" element={<OrderTracking />} /> */}
  <Route path="/cart" element={<Cart />} />

        {/* Authenticated Routes */}

        {/* Routes that requires user to log in */}
        <Route path="/authenticated" element={<ProtectedRoute />}>
          {/* route mà cần user đã đăng nhập mới truy cập được thì thả vào đây */}

        </Route>

        {/* Routes that requires user to have role ABC */}
        <Route path="/admin" element={<ProtectedRoute requiredRoles={["admin"]} />}>
          {/* route mà cần user phải có role ADMIN thả vào đây */}
          <Route index element={<AdminDashboard />} />

        </Route>

        {/* Nếu trang liến quan đến quản lí mà
           cùng 1 trang hiển thị các chức năng khác nhau cho mỗi role riêng 
           thì chỉ cần ném nó vào mục này
        */}
      {/* Staff Routes */}
        <Route path="/">
          <Route path="import" element={<CreateImportOrder />} />
          <Route path="imports" element={<ImportOrdersList />} />
        </Route>

        {/* làm tương tự cho các route cần role khác */}

      </Routes>
    </Router>
  );
}

export default App;
