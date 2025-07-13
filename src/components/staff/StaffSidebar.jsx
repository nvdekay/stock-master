import React from "react";
import { Nav, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import {
  FaBoxes,
  FaClipboardList,
  FaWarehouse,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";

import "./StaffSidebar.css";

const StaffSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="staff-sidebar bg-light shadow-sm">
      <div className="sidebar-header p-3 border-bottom">
        <h5 className="m-0">Staff Portal</h5>
      </div>
      <Nav className="flex-column p-3">
        <Nav.Item>
          <NavLink to="/staff/dashboard" className="nav-link">
            <FaHome className="me-2" /> Dashboard
          </NavLink>
        </Nav.Item>
        <Nav.Item>
          <NavLink to="/staff/imports" className="nav-link">
            <FaBoxes className="me-2" /> Import Orders
          </NavLink>
        </Nav.Item>
        <Nav.Item>
          <NavLink to="/staff/create-import" className="nav-link">
            <FaClipboardList className="me-2" /> Create Import
          </NavLink>
        </Nav.Item>
        <Nav.Item>
          <NavLink to="/staff/inventory" className="nav-link">
            <FaWarehouse className="me-2" /> Inventory
          </NavLink>
        </Nav.Item>
        <Nav.Item>
          <NavLink to="/staff/logs" className="nav-link">
            <FaClipboardList className="me-2" /> Activity Logs
          </NavLink>
        </Nav.Item>
      </Nav>
      <div className="sidebar-footer p-3 mt-auto border-top">
        <Button
          variant="outline-secondary"
          className="w-100"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </Button>
      </div>
    </div>
  );
};

export default StaffSidebar;
