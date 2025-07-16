import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../auth/AuthProvider";
import axios from "axios";

function Cart() {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [enterprises, setEnterprises] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, productRes, enterpriseRes] = await Promise.all([
          axios.get("http://localhost:9999/carts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:9999/products"),
          axios.get("http://localhost:9999/enterprises", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCartItems(cartRes.data.filter(item => item.userId === user.id));
        setProducts(productRes.data);
        setEnterprises(enterpriseRes.data);
      } catch (error) {
        console.error("Lỗi khi load giỏ hàng:", error);
      }
    };

    fetchData();
  }, [user, token]);

  const getProductById = (id) => products.find(p => p.id === id);
  const getEnterpriseName = (enterpriseId) => {
    const e = enterprises.find(en => en.id === enterpriseId);
    return e ? e.name : "Không rõ";
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      await axios.patch(
        `http://localhost:9999/carts/${cartItemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // ✅ Cập nhật UI ngay sau khi PATCH thành công
      setCartItems(prev =>
        prev.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      alert("Không thể cập nhật số lượng");
    }
  };


  return (
    <Container className="mt-4">
      <h2>🛒 Giỏ hàng của bạn</h2>
      <Row>
        {cartItems.map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;

          return (
            <Col key={item.id} xs={12} className="mb-4">
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
                    <Card.Text>💰 {product.price*item.quantity} ₫</Card.Text>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <br/>
                    <Button variant="danger" size="sm" style={{marginRight: "20px"}} onClick={(e)=>handleDeleteProduct(e)}>Xoá</Button>
                    
                    <Button variant="warning" size="sm">Mua</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default Cart;
