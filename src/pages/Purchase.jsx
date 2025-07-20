
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { usePurchase } from "../contexts/PurchaseContext";
import axios from "axios";

function PurchasePage() {
  const { user, token } = useAuth();
  const { itemsToPurchase, setItemsToPurchase } = usePurchase();
  const [products, setProducts] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, enterpriseRes] = await Promise.all([
          axios.get("http://localhost:9999/products"),
          axios.get("http://localhost:9999/enterprises"),
        ]);
        setProducts(productRes.data);
        setEnterprises(enterpriseRes.data);
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const initQuantities = {};
    itemsToPurchase.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const maxAvailable = product?.quantity || 0;
      initQuantities[item.productId] = Math.min(item.quantity || 1, maxAvailable);
    });
    setQuantities(initQuantities);
  }, [itemsToPurchase, products]);

  const getProductById = (id) => products.find(p => p.id === id);
  const getEnterpriseName = (enterpriseId) => {
    const e = enterprises.find(en => en.id === enterpriseId);
    return e ? e.name : "Không rõ";
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = getProductById(productId);
    const max = product?.quantity || 0;
    if (newQuantity < 1 || newQuantity > max) return;
    setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
  };

  const handlePurchase = async () => {
    if (!address.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    try {
      for (const item of itemsToPurchase) {
        const quantity = quantities[item.productId];
        const product = getProductById(item.productId);

        if (!product || quantity > product.quantity) {
          alert(`Sản phẩm ${product?.name || item.productId} không đủ hàng`);
          continue;
        }

        await axios.post("http://localhost:9999/orders", {
          userId: user.id,
          productId: item.productId,
          quantity,
          address,
          status: "pending",
          type: "wholesale",
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert("Đặt hàng thành công!");
      setItemsToPurchase([]);
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Không thể thực hiện đặt hàng");
    }
  };

  return (
    <Container className="mt-4">
      <h2>🛒 Xác nhận mua hàng</h2>
      <Row>
        {itemsToPurchase.map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;

          return (
            <Col key={item.productId} xs={12} className="mb-4">
              <Card>
                <Card.Body className="d-flex align-items-center">
                  <img
                    src={product.src}
                    alt={product.name}
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "contain",
                      marginRight: "20px",
                      backgroundColor: "#f8f9fa",
                      padding: "5px",
                    }}
                  />
                  <div>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      💼 {getEnterpriseName(product.warehouseId)}
                    </Card.Subtitle>
                    <Card.Text>💰 {product.price * (quantities[item.productId] || 1)} ₫</Card.Text>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, quantities[item.productId] - 1)}
                      >
                        -
                      </button>

                      <span>{quantities[item.productId] || 1}</span>

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, quantities[item.productId] + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Form className="mt-4">
        <Form.Group className="mb-3" controlId="formAddress">
          <Form.Label>Địa chỉ giao hàng</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập địa chỉ giao hàng"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Form.Group>
        <Button variant="success" onClick={handlePurchase}>Xác nhận mua hàng</Button>
      </Form>
    </Container>
  );
}

export default PurchasePage;
