import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { useAuth } from "../../auth/AuthProvider";

const StaffDashboard = () => {
  const [pendingImports, setPendingImports] = useState([]);
  const [completedImports, setCompletedImports] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);

        if (!user?.warehouseId) {
          setError("No warehouse assigned to your account");
          setLoading(false);
          return;
        }

        const warehouseRes = await api.get(`/warehouses/${user.warehouseId}`);
        setWarehouse(warehouseRes.data);

        const ordersRes = await api.get("/orders", {
          params: {
            type: "import",
            receiveWarehouseId: user.warehouseId,
            _sort: "date",
            _order: "desc",
          },
        });

        // Split orders into pending and completed
        const pending = ordersRes.data.filter(
          (order) => order.status === "in_transit" || order.status === "pending"
        );
        const completed = ordersRes.data.filter(
          (order) => order.status === "completed"
        );

        setPendingImports(pending);
        setCompletedImports(completed);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching staff data", err);
        setError("Could not load dashboard data");
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [user]);

  const handleViewImport = (orderId) => {
    navigate(`/staff/import-order/${orderId}`);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Alert variant="info">Loading dashboard data...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1>Staff Dashboard</h1>
      <p>Welcome, {user?.fullName || user?.username}</p>

      {warehouse && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Your Warehouse</Card.Title>
            <Card.Text>
              <strong>Name:</strong> {warehouse.name}
              <br />
              <strong>Location:</strong> {warehouse.location}
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header as="h5">
              Pending Imports
              <Badge bg="warning" className="ms-2">
                {pendingImports.length}
              </Badge>
            </Card.Header>
            <Card.Body>
              {pendingImports.length === 0 ? (
                <p className="text-muted">No pending imports</p>
              ) : (
                pendingImports.map((order) => (
                  <Card key={order.id} className="mb-3">
                    <Card.Body>
                      <Card.Title>Import Order #{order.id}</Card.Title>
                      <Card.Text>
                        <Badge
                          bg={
                            order.status === "in_transit" ? "info" : "warning"
                          }
                        >
                          {order.status === "in_transit"
                            ? "In Transit"
                            : "Pending"}
                        </Badge>
                        <br />
                        <strong>Date:</strong>{" "}
                        {new Date(order.date).toLocaleDateString()}
                        <br />
                        <strong>From:</strong> {order.sendWarehouseId}
                        <br />
                        <strong>Note:</strong> {order.note || "No note provided"}
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() => handleViewImport(order.id)}
                      >
                        Process Import
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header as="h5">
              Completed Imports
              <Badge bg="success" className="ms-2">
                {completedImports.length}
              </Badge>
            </Card.Header>
            <Card.Body>
              {completedImports.length === 0 ? (
                <p className="text-muted">No completed imports</p>
              ) : (
                completedImports.map((order) => (
                  <Card key={order.id} className="mb-3">
                    <Card.Body>
                      <Card.Title>Import Order #{order.id}</Card.Title>
                      <Card.Text>
                        <Badge bg="success">Completed</Badge>
                        <br />
                        <strong>Date:</strong>{" "}
                        {new Date(order.date).toLocaleDateString()}
                        <br />
                        <strong>From:</strong> {order.sendWarehouseId}
                        <br />
                        <strong>Note:</strong> {order.note || "No note provided"}
                      </Card.Text>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleViewImport(order.id)}
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Button
            variant="success"
            onClick={() => navigate("/staff/inventory")}
            className="me-2"
          >
            View Inventory
          </Button>
          {/* <Button
            variant="info"
            onClick={() => navigate("/staff/create-import")}
          >
            Create Import Order
          </Button> */}
        </Col>
      </Row>
    </Container>
  );
};

export default StaffDashboard;
