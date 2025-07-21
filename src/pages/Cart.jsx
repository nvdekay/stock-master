import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../auth/AuthProvider";
import axios from "axios";
import { useCart } from "../contexts/CartContext"; // Import useCart để cập nhật giỏ hàng
import { usePurchase } from "../contexts/PurchaseContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]); // sẽ là cart.items
  const [products, setProducts] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [cartId, setCartId] = useState(null); // để PATCH vào đúng cart
  const { updateCartItems } = useCart(); // Lấy hàm cập nhật giỏ hàng từ context

  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelect = (item) => {
    setSelectedItems((prevSelected) => {
      const exists = prevSelected.some(i => i.productId === item.productId);
      return exists
        ? prevSelected.filter(i => i.productId !== item.productId)
        : [...prevSelected, item];
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, productRes, enterpriseRes] = await Promise.all([
          axios.get(`http://localhost:9999/carts?userID=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:9999/products"),
          axios.get("http://localhost:9999/enterprises", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const cartData = cartRes.data[0];
        if (cartData) {
          setCartId(cartData.id);
          setCartItems(cartData.items);
        } else {
          setCartItems([]);
        }

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

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const newItems = cartItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );

      await axios.patch(
        `http://localhost:9999/carts/${cartId}`,
        { items: newItems },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCartItems(newItems); // cập nhật UI
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      alert("Không thể cập nhật số lượng");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này khỏi giỏ hàng?")) {
      return;
    }

    const filteredItems = cartItems.filter(item => item.productId !== productId);

    try {
      await axios.patch(`http://localhost:9999/carts/${cartId}`, {
        items: filteredItems
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCartItems(filteredItems);
      updateCartItems(); // Cập nhật số lượng item trong giỏ hàng
      alert("Đã xoá sản phẩm khỏi giỏ hàng");
    } catch (error) {
      console.error("Lỗi khi xoá sản phẩm khỏi giỏ:", error);
      alert("Không thể xoá sản phẩm");
    }
  };

  const { itemsToPurchase, setItemsToPurchase } = usePurchase();

  const handleBuySelected = () => {
    setItemsToPurchase(selectedItems);
    // Trì hoãn navigate để đảm bảo context cập nhật xong
    setTimeout(() => {
      navigate("/purchase");
    }, 50);
  };



  return (
    <Container className="mt-4">
      <h2>Giỏ hàng của bạn</h2>
      <Row>
        {cartItems.map((item) => {
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
                      {getEnterpriseName(product.warehouseId)}
                    </Card.Subtitle>
                    <Card.Text>💰 {product.price * item.quantity} ₫</Card.Text>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <br />
                    <Button variant="danger" size="sm" style={{ marginRight: "20px" }}
                      onClick={() => handleDeleteProduct(item.productId)}>
                      Xoá
                    </Button>
                    <div key={item.productId}>
                      <input
                        type="checkbox"
                        checked={selectedItems.some(i => i.productId === item.productId)}
                        onChange={() => toggleSelect(item)}
                        style={{ marginTop: "10px", width: "20px", height: "20px" }}
                      />
                      <p>
                        Chọn sản phẩm này để mua
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      <Button
        variant="warning"
        disabled={selectedItems.length === 0}
        onClick={() => handleBuySelected()}
        style={{ marginBottom: "20px" }}
      >
        Mua các sản phẩm đã chọn
      </Button>
      <hr />
      {itemsToPurchase?.map((item) => {
        return (
          <div key={item.productId}>
            <h5>{getProductById(item.productId)?.name}</h5>
            <p>💰 {getProductById(item.productId)?.price * item.quantity} ₫</p>
            <p>Số lượng: {item.quantity}</p>
          </div>

        )

      })}
    </Container>
  );
}

export default Cart;
