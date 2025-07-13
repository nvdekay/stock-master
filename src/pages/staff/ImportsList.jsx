import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaSearch, FaFilter, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import api from "../../api/axiosInstance";

const ImportsList = () => {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchImports = async () => {
      try {
        setLoading(true);

        // Fetch import orders for this staff's warehouse
        const params = {
          type: "import",
          receiveWarehouseId: user?.warehouseId,
          _expand: "enterprise",
          _sort: "date",
          _order: "desc",
        };

        const response = await api.get("/orders", { params });
        setImports(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching imports", err);
        setError("Could not load import orders data");
        setLoading(false);
      }
    };

    fetchImports();
  }, [user]);

  const handleViewImport = (orderId) => {
    navigate(`/staff/import-order/${orderId}`);
  };

  // Filter imports based on search term and status filter
  const filteredImports = imports.filter((importOrder) => {
    const matchesSearch =
      searchTerm === "" ||
      importOrder.id.toString().includes(searchTerm) ||
      (importOrder.enterprise?.name &&
        importOrder.enterprise.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (importOrder.note &&
        importOrder.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || importOrder.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
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
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Import Orders</h1>
        <Button
          variant="primary"
          onClick={() => navigate("/staff/create-import")}
        >
          Create New Import
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-md-flex justify-content-between mb-3">
            <InputGroup className="mb-3 mb-md-0" style={{ maxWidth: "400px" }}>
              <InputGroup.Text id="search-addon">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by ID, enterprise, or note"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <div className="d-flex align-items-center">
              <FaFilter className="me-2" />
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </div>
          </div>

          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Enterprise</th>
                <th>From Warehouse</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No import orders found
                  </td>
                </tr>
              ) : (
                filteredImports.map((importOrder) => (
                  <tr key={importOrder.id}>
                    <td>{importOrder.id}</td>
                    <td>{new Date(importOrder.date).toLocaleDateString()}</td>
                    <td>{importOrder.enterprise?.name}</td>
                    <td>{importOrder.sendWarehouseId}</td>
                    <td>
                      <Badge
                        bg={
                          importOrder.status === "completed"
                            ? "success"
                            : importOrder.status === "in_transit"
                            ? "info"
                            : "warning"
                        }
                      >
                        {importOrder.status === "completed"
                          ? "Completed"
                          : importOrder.status === "in_transit"
                          ? "In Transit"
                          : "Pending"}
                      </Badge>
                    </td>
                    <td>
                      {importOrder.status === "pending" ||
                      importOrder.status === "in_transit" ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewImport(importOrder.id)}
                        >
                          Process
                        </Button>
                      ) : (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewImport(importOrder.id)}
                        >
                          <FaEye className="me-1" /> View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ImportsList;
