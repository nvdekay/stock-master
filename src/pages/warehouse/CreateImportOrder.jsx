import { useEffect, useState } from "react";
import { Container, Form, Button, Table, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
// import "../../public/assets/css/CreateImportOrder.css";

function CreateImportOrder() {
  const userId = 1; // Hardcode user ID to bypass authentication
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [note, setNote] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:9999/products"),
      axios.get("http://localhost:9999/warehouses"),
    ])
      .then(([productsRes, warehousesRes]) => {
        console.log("Products fetched:", productsRes.data);
        console.log("Warehouses fetched:", warehousesRes.data);
        setProducts(productsRes.data);
        setWarehouses(warehousesRes.data);
        if (warehousesRes.data.length > 0) {
          setSelectedWarehouse(warehousesRes.data[0].id);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setAlert({ show: true, message: `Lỗi khi fetch dữ liệu: ${err.message}`, variant: "danger" });
      });
  }, []);

  const handleAddProduct = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    if (product && !selectedProducts.find((sp) => sp.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.id === productId ? { ...p, quantity: parseInt(quantity) || 0 } : p
      )
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWarehouse || selectedProducts.length === 0) {
      setAlert({
        show: true,
        message: "Vui lòng chọn kho và ít nhất một sản phẩm",
        variant: "danger",
      });
      return;
    }

    try {
      const importOrder = {
        staffId: userId,
        warehouseId: parseInt(selectedWarehouse),
        date: new Date().toISOString().split("T")[0],
        note,
      };
      const orderRes = await axios.post("http://localhost:9999/importOrders", importOrder);
      const orderId = orderRes.data.id;

      const orderDetailsPromises = selectedProducts.map((product) =>
        axios.post("http://localhost:9999/orderDetails", {
          orderType: "import",
          orderId,
          productId: product.id,
          quantity: product.quantity,
        })
      );
      await Promise.all(orderDetailsPromises);

      const inventoryPromises = selectedProducts.map((product) =>
        axios
          .get(
            `http://localhost:9999/inventory?productId=${product.id}&warehouseId=${selectedWarehouse}`
          )
          .then((res) => {
            const existing = res.data[0];
            if (existing) {
              return axios.patch(`http://localhost:9999/inventory/${existing.id}`, {
                quantity: existing.quantity + product.quantity,
              });
            } else {
              return axios.post("http://localhost:9999/inventory", {
                productId: product.id,
                warehouseId: parseInt(selectedWarehouse),
                quantity: product.quantity,
              });
            }
          })
      );
      await Promise.all(inventoryPromises);

      setAlert({
        show: true,
        message: "Tạo phiếu nhập thành công",
        variant: "success",
      });
      setSelectedProducts([]);
      setNote("");
    } catch (err) {
      console.error("Submit error:", err);
      setAlert({
        show: true,
        message: `Lỗi khi tạo phiếu nhập: ${err.message}`,
        variant: "danger",
      });
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📋 Tạo phiếu nhập</h2>
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Kho</Form.Label>
              <Form.Select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                required
              >
                <option value="">Chọn kho</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.location})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Thêm sản phẩm</Form.Label>
              <Form.Select onChange={(e) => handleAddProduct(e.target.value)}>
                <option value="">Chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Ghi chú</Form.Label>
          <Form.Control
            as="textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú tùy chọn"
          />
        </Form.Group>
        {selectedProducts.length > 0 && (
          <Table striped bordered hover className="mb-3">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Button variant="primary" type="submit">
          Tạo phiếu nhập
        </Button>
      </Form>
    </Container>
  );
}

export default CreateImportOrder;