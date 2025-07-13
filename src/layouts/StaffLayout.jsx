import React from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staff/StaffSidebar";
import { Container, Row, Col } from "react-bootstrap";

const StaffLayout = () => {
  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Col md={3} lg={2} className="d-md-block sidebar">
          <StaffSidebar />
        </Col>
        <Col md={9} lg={10} className="ms-sm-auto px-md-4 main-content">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default StaffLayout;
