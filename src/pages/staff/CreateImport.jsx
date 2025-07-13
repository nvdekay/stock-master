import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import "./CreateImport.css";

const CreateImport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [enterprises, setEnterprises] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [formData, setFormData] = useState({
    enterpriseId: "",
    receiveWarehouseId: user?.warehouseId || "",
    sendWarehouseId: "",
    note: "",
    expectedDeliveryDate: "",
  });

  // Fetch enterprises, warehouses and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [enterprisesRes, warehousesRes, productsRes] = await Promise.all([
          api.get("/enterprises"),
          api.get("/warehouses"),
          api.get("/products"),
        ]);

        setEnterprises(enterprisesRes.data);
        setWarehouses(warehousesRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelection = (e, product) => {
    const isSelected = e.target.checked;

    if (isSelected) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    } else {
      setSelectedProducts((prev) =>
        prev.filter((item) => item.productId !== product.id)
      );
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;

    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedProducts
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      setError("Please select at least one product");
      return;
    }

    if (!formData.sendWarehouseId) {
      setError("Please select a sending warehouse");
      return;
    }

    if (!formData.enterpriseId) {
      setError("Please select an enterprise");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    setLoading(true);
    try {
      // Create the order
      const orderData = {
        type: "import",
        status: "pending",
        date: today,
        enterpriseId: formData.enterpriseId,
        senderStaffId: null, // Will be assigned later
        receiverStaffId: user.id,
        sendWarehouseId: formData.sendWarehouseId,
        receiveWarehouseId: user.warehouseId,
        buyerId: null,
        note: formData.note,
      };

      const orderResponse = await api.post("/orders", orderData);
      const orderId = orderResponse.data.id;

      // Create the order details as a batch for better performance
      const orderDetails = selectedProducts.map((product) => ({
        orderId,
        productId: product.productId,
        quantity: product.quantity,
        price: product.price,
      }));

      // Create each order detail
      const createDetailPromises = orderDetails.map((detail) =>
        api.post("/orderDetails", detail)
      );

      // Wait for all details to be created
      await Promise.all(createDetailPromises);

      setSuccess("Import order created successfully");
      setError("");

      // Clear form
      setFormData({
        enterpriseId: "",
        receiveWarehouseId: user?.warehouseId || "",
        sendWarehouseId: "",
        note: "",
        expectedDeliveryDate: "",
      });
      setSelectedProducts([]);

      // Redirect to imports list after a short delay
      setTimeout(() => {
        navigate("/staff/imports");
      }, 2000);
    } catch (err) {
      console.error("Error creating import order:", err);
      setError(`Failed to create import order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Create New Warehouse Import Order</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Enterprise</Form.Label>
                  <Form.Select
                    name="enterpriseId"
                    value={formData.enterpriseId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Enterprise</option>
                    {enterprises.map((enterprise) => (
                      <option key={enterprise.id} value={enterprise.id}>
                        {enterprise.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Source Warehouse</Form.Label>
                  <Form.Select
                    name="sendWarehouseId"
                    value={formData.sendWarehouseId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Source Warehouse</option>
                    {warehouses
                      .filter((warehouse) => warehouse.id !== user?.warehouseId)
                      .map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Expected Delivery Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Enter any special instructions or notes"
              />
            </Form.Group>

            <hr className="my-4" />

            <h5>Select Products</h5>

            <div className="product-selection-container">
              <div className="product-list">
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading products...</p>
                  </div>
                ) : (
                  <div className="product-grid">
                    {products.map((product) => (
                      <div key={product.id} className="product-item">
                        <div className="d-flex align-items-center">
                          <Form.Check
                            type="checkbox"
                            id={`product-${product.id}`}
                            onChange={(e) => handleProductSelection(e, product)}
                            checked={selectedProducts.some(
                              (item) => item.productId === product.id
                            )}
                          />
                          <label
                            htmlFor={`product-${product.id}`}
                            className="ms-2"
                          >
                            <strong>{product.name}</strong>
                            <div className="text-muted">
                              Price: ${product.price}
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div className="selected-products mt-4">
                <h5>Selected Products</h5>
                <Table striped bordered responsive className="mt-3">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((item) => (
                      <tr key={item.productId}>
                        <td>{item.productName}</td>
                        <td>${item.price}</td>
                        <td>
                          <div className="quantity-control">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="table-active">
                      <td colSpan="3" className="text-end">
                        <strong>Grand Total:</strong>
                      </td>
                      <td>
                        <strong>${calculateTotal()}</strong>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            )}

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => navigate("/staff/imports")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || selectedProducts.length === 0}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      size="sm"
                      animation="border"
                      className="me-1"
                    />
                    Creating...
                  </>
                ) : (
                  "Create Warehouse Import Order"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateImport;
