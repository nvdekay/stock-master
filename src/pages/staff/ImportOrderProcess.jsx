import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Table,
  Form,
  Button,
  Alert,
  Modal,
  Badge,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
import api from "../../api/axiosInstance";
import { useAuth } from "../../auth/AuthProvider";

const ImportOrderProcess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // We'll keep these states for future product management functionality
  // const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // State to track which products are defective
  const [defectiveItems, setDefectiveItems] = useState({});

  // State for new product
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    status: "available",
    warrantyExpire: "",
  });
  const [newProductQuantity, setNewProductQuantity] = useState(1);
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState("");

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);

        // Get order details
        const orderRes = await api.get(`/orders/${orderId}?_expand=enterprise`);
        setOrder(orderRes.data);

        // Get order items
        const orderDetailsRes = await api.get(
          `/orderDetails?orderId=${orderId}&_expand=product`
        );
        setOrderDetails(orderDetailsRes.data);

        // Get product types for new product form
        const productTypesRes = await api.get(`/product_types`);
        setProductTypes(productTypesRes.data);

        // Initialize defective items state
        const defectiveState = {};
        orderDetailsRes.data.forEach((item) => {
          defectiveState[item.id] = false;
        });
        setDefectiveItems(defectiveState);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching import order", err);
        setError("Could not load import order data");
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleDefectiveToggle = (detailId) => {
    setDefectiveItems({
      ...defectiveItems,
      [detailId]: !defectiveItems[detailId],
    });
  };

  // Handle input changes for new product form
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open new product modal
  const openNewProductModal = () => {
    setShowNewProductModal(true);
  };

  // Close new product modal
  const closeNewProductModal = () => {
    setShowNewProductModal(false);
    // Reset form
    setNewProduct({
      name: "",
      description: "",
      price: "",
      status: "available",
      warrantyExpire: "",
    });
    setNewProductQuantity(1);
    setSelectedProductType("");
  };

  // Add new product
  const handleAddNewProduct = async () => {
    try {
      setSubmitting(true);

      // Calculate warranty expiration date (1 year from now)
      const warrantyDate = new Date();
      warrantyDate.setFullYear(warrantyDate.getFullYear() + 1);
      const formattedWarrantyDate = warrantyDate.toISOString().split("T")[0];

      // Create new product
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        warrantyExpire: newProduct.warrantyExpire || formattedWarrantyDate,
        productTypeId: selectedProductType || undefined,
      };

      const productRes = await api.post("/products", productData);
      const newProductData = productRes.data;

      // Create new order detail with the new product
      const orderDetailData = {
        orderId,
        productId: newProductData.id,
        quantity: newProductQuantity,
        price: newProductData.price,
      };

      const orderDetailRes = await api.post("/orderDetails", orderDetailData);

      // Add the new product to the order details list
      const expandedDetail = {
        ...orderDetailRes.data,
        product: newProductData,
      };

      setOrderDetails((prev) => [...prev, expandedDetail]);

      // Success message and close modal
      setSuccess(`Product "${newProductData.name}" added successfully!`);
      closeNewProductModal();
    } catch (err) {
      console.error("Error adding new product:", err);
      setError(err.response?.data?.message || "Failed to add new product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // For each order detail, specify which are accepted and which are defective
      const acceptedItems = [];
      const defectiveItemsList = [];

      orderDetails.forEach((detail) => {
        // Check if this item has a defective status set
        // For new products that were just added, they won't have an entry in defectiveItems
        const isDefective = defectiveItems[detail.id] === true;

        if (isDefective) {
          defectiveItemsList.push({
            detailId: detail.id,
            productId: detail.productId,
            quantity: detail.quantity,
          });
        } else {
          acceptedItems.push({
            detailId: detail.id,
            productId: detail.productId,
            quantity: detail.quantity,
            price: detail.price,
          });
        }
      });

      // Send to API
      await api.post(`/orders/${orderId}/process`, {
        acceptedItems,
        defectiveItems: defectiveItemsList,
        staffId: user.id,
        warehouseId: user.warehouseId,
      });

      setSuccess("Import processing completed successfully!");
      setSubmitting(false);
      setShowConfirmModal(false);

      // Refresh order data
      const updatedOrderRes = await api.get(
        `/orders/${orderId}?_expand=enterprise`
      );
      setOrder(updatedOrderRes.data);
    } catch (err) {
      console.error("Error processing import", err);
      setError(err.response?.data?.message || "Failed to process import order");
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const openConfirmModal = () => {
    setShowConfirmModal(true);
  };

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
        <Button variant="primary" onClick={() => navigate("/staff/dashboard")}>
          <FaArrowLeft className="me-2" /> Back to Dashboard
        </Button>
      </Container>
    );
  }

  const isOrderCompleted = order?.status === "completed";

  return (
    <Container className="my-4">
      <Button
        variant="outline-primary"
        className="mb-3"
        onClick={() => navigate("/staff/dashboard")}
      >
        <FaArrowLeft className="me-2" /> Back to Dashboard
      </Button>

      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Header as="h5">
          Import Order #{order?.id}
          <Badge
            bg={
              order?.status === "completed"
                ? "success"
                : order?.status === "in_transit"
                ? "info"
                : "warning"
            }
            className="ms-2"
          >
            {order?.status === "completed"
              ? "Completed"
              : order?.status === "in_transit"
              ? "In Transit"
              : "Pending"}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order?.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Enterprise:</strong> {order?.enterprise?.name}
              </p>
              <p>
                <strong>From Warehouse:</strong> {order?.sendWarehouseId}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>To Warehouse:</strong> {order?.receiveWarehouseId}
              </p>
              <p>
                <strong>Note:</strong> {order?.note || "No note provided"}
              </p>
              {order?.completedDate && (
                <p>
                  <strong>Completed Date:</strong>{" "}
                  {new Date(order.completedDate).toLocaleDateString()}
                </p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header as="h5">Order Items</Card.Header>
        <Card.Body>
          {!isOrderCompleted && (
            <div className="mb-3 d-flex justify-content-end">
              <Button variant="success" size="sm" onClick={openNewProductModal}>
                + Add New Product
              </Button>
            </div>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Product</th>
                <th>Image</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Price</th>
                {!isOrderCompleted && <th>Mark as Defective</th>}
                {isOrderCompleted && <th>Status</th>}
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((detail) => (
                <tr key={detail.id}>
                  <td>{detail.product.name}</td>
                  <td>
                    <img
                      src={
                        detail.product.image ||
                        "/assets/images/products/default.jpg"
                      }
                      alt={detail.product.name}
                      style={{ maxHeight: "50px" }}
                    />
                  </td>
                  <td>{detail.product.sku}</td>
                  <td>{detail.quantity}</td>
                  <td>${detail.price.toFixed(2)}</td>
                  {!isOrderCompleted ? (
                    <td>
                      <Form.Check
                        type="switch"
                        id={`defective-${detail.id}`}
                        checked={defectiveItems[detail.id]}
                        onChange={() => handleDefectiveToggle(detail.id)}
                        label="Defective"
                      />
                    </td>
                  ) : (
                    <td>
                      {detail.status === "refunded" ? (
                        <Badge bg="danger">Defective - Refunded</Badge>
                      ) : (
                        <Badge bg="success">Accepted</Badge>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>

          {!isOrderCompleted && (
            <div className="d-flex justify-content-end mt-3">
              <Button
                variant="primary"
                onClick={openConfirmModal}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Processing...
                  </>
                ) : (
                  <>Process Import</>
                )}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Import Processing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to process this import order?</p>
          <p>
            <strong>
              {Object.values(defectiveItems).filter(Boolean).length}
            </strong>{" "}
            items will be marked as defective and refunded.
          </p>
          <p>
            <strong>
              {orderDetails.length -
                Object.values(defectiveItems).filter(Boolean).length}
            </strong>{" "}
            items will be accepted and added to inventory.
          </p>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Product Modal */}
      <Modal show={showNewProductModal} onHide={closeNewProductModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Name*</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={newProduct.description}
                onChange={handleNewProductChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price*</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleNewProductChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={newProduct.status}
                    onChange={handleNewProductChange}
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Type</Form.Label>
                  <Form.Select
                    value={selectedProductType}
                    onChange={(e) => setSelectedProductType(e.target.value)}
                  >
                    <option value="">Select Product Type</option>
                    {productTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warranty Expiration</Form.Label>
                  <Form.Control
                    type="date"
                    name="warrantyExpire"
                    value={newProduct.warrantyExpire}
                    onChange={handleNewProductChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Quantity*</Form.Label>
              <Form.Control
                type="number"
                value={newProductQuantity}
                onChange={(e) => setNewProductQuantity(Number(e.target.value))}
                min="1"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeNewProductModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddNewProduct}
            disabled={!newProduct.name || !newProduct.price || submitting}
          >
            {submitting ? "Adding..." : "Add Product"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ImportOrderProcess;
