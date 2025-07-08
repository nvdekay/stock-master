import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
// import Cart from "./pages/Cart";
// import CreateOrder from "./pages/CreateOrder";
// import OrderTracking from "./pages/OrderTracking";

function App() {
  return (
    <Router>
      <Routes>

        {/* Chuyển "/" về "/products" */}
        <Route path="/" element={<Navigate to="/products" replace />} />

        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        {/* <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<CreateOrder />} />
        <Route path="/orders" element={<OrderTracking />} /> */}

      </Routes>
    </Router>
  );
}

export default App;
