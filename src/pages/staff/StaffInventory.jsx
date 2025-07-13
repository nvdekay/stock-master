import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Alert,
  Spinner,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaWarehouse,
} from "react-icons/fa";
import { useAuth } from "../../auth/AuthProvider";

import api from "../../api/api";

const StaffInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const { user } = useAuth();

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);

        if (!user?.warehouseId) {
          setError("No warehouse assigned to your account");
          setLoading(false);
          return;
        }

        // Fetch warehouse information
        const warehouseRes = await api.get(`/warehouses/${user.warehouseId}`);
        setWarehouse(warehouseRes.data);

        // Fetch inventory for this warehouse
        const inventoryRes = await api.get("/inventory", {
          params: {
            warehouseId: user.warehouseId,
            _expand: "product",
          },
        });

        setInventory(inventoryRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching inventory data", err);
        setError("Could not load inventory data");
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [user.warehouseId]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Apply sorting and filtering
  const filteredInventory = [...inventory]
    .filter(
      (item) =>
        searchTerm === "" ||
        (item.product?.name &&
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.product?.sku &&
          item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.product?.description &&
          item.product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let compareA, compareB;

      // Determine what to compare based on sort field
      switch (sortField) {
        case "name":
          compareA = a.product?.name || "";
          compareB = b.product?.name || "";
          break;
        case "sku":
          compareA = a.product?.sku || "";
          compareB = b.product?.sku || "";
          break;
        case "quantity":
          compareA = a.quantity;
          compareB = b.quantity;
          break;
        case "price":
          compareA = a.product?.price || 0;
          compareB = b.product?.price || 0;
          break;
        default:
          compareA = a.product?.name || "";
          compareB = b.product?.name || "";
      }

      // String comparison
      if (typeof compareA === "string") {
        return sortDirection === "asc"
          ? compareA.localeCompare(compareB)
          : compareB.localeCompare(compareA);
      }

      // Number comparison
      return sortDirection === "asc"
        ? compareA - compareB
        : compareB - compareA;
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

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <FaSortAmountUp className="ms-1" />
    ) : (
      <FaSortAmountDown className="ms-1" />
    );
  };

  return (
    <Container className="my-4">
      <h1>Warehouse Inventory</h1>

      {warehouse && (
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <h5>
                  <FaWarehouse className="me-2" />
                  {warehouse.name}
                </h5>
                <p>{warehouse.location}</p>
              </Col>
              <Col md={6} className="text-md-end">
                <h5>Total Products: {inventory.length}</h5>
                <p>
                  Total Items:{" "}
                  {inventory.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Body>
          <div className="d-md-flex justify-content-between mb-3">
            <InputGroup className="mb-3 mb-md-0" style={{ maxWidth: "400px" }}>
              <InputGroup.Text id="search-addon">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by name, SKU, or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Image</th>
                <th
                  onClick={() => handleSort("name")}
                  style={{ cursor: "pointer" }}
                >
                  Product Name <SortIcon field="name" />
                </th>
                <th
                  onClick={() => handleSort("sku")}
                  style={{ cursor: "pointer" }}
                >
                  SKU <SortIcon field="sku" />
                </th>
                <th
                  onClick={() => handleSort("quantity")}
                  style={{ cursor: "pointer" }}
                >
                  Quantity <SortIcon field="quantity" />
                </th>
                <th
                  onClick={() => handleSort("price")}
                  style={{ cursor: "pointer" }}
                >
                  Price <SortIcon field="price" />
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={
                          item.product?.image ||
                          "/assets/images/products/default.jpg"
                        }
                        alt={item.product?.name}
                        style={{ maxHeight: "50px" }}
                      />
                    </td>
                    <td>{item.product?.name}</td>
                    <td>{item.product?.sku}</td>
                    <td>
                      {item.quantity}
                      {item.quantity <= 5 && (
                        <Badge bg="danger" className="ms-2">
                          Low
                        </Badge>
                      )}
                    </td>
                    <td>${item.product?.price?.toFixed(2) || "0.00"}</td>
                    <td>
                      {item.quantity > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="secondary">Out of Stock</Badge>
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

export default StaffInventory;
