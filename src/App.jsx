import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import WarehousesDB from "./pages/manager/WarehousesDB";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/warehouse" element={<WarehousesDB />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
