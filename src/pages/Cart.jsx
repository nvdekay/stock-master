import { useEffect, useState } from "react";
import { Container, Table, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import "../../public/assets/css/Cart.css";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });

  // Hardcode user ID to match ProductList's no-auth approach
  const userId = 1;

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
    setCartItems(storedCart);

    axios
      .get("http://localhost:9999/products")
      .then((res) => {
        console.log("Products fetched:", res.data);
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi fetch sản phẩm:", err);
        setAlert({ show: true, message: `Lỗi khi fetch sản phẩm: ${err.message}`, variant: "danger" });
      });
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    const updatedCart = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: parseInt(quantity) || 0 } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (productId) => {
    const updatedCart = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setAlert({ show: true, message: "Giỏ hàng trống", variant: "danger" });
      return;
    }

    try {
      const totalPrice = cartItems.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);

      const wholesaleOrder = {
        buyerId: userId,
        status: "pending",
        totalPrice,
        date: new Date().toISOString().split("T")[0],
      };
      const orderRes = await axios.post("http://localhost:9999/wholesaleOrders", wholesaleOrder);
      const orderId = orderRes.data.id;

      const orderItemsPromises = cartItems.map((item) =>
        axios.post("http://localhost:9999/wholesaleOrderItems", {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
        })
      );
      await Promise.all(orderItemsPromises);

      setCartItems([]);
      localStorage.removeItem(`cart_${userId}`);

      setAlert({ show: true, message: "Đặt hàng thành công", variant: "success" });
      setTimeout(() => navigate("/orders"), 1500);
    } catch (err) {
      console.error("Checkout error:", err);
      setAlert({ show: true, message: `Lỗi khi đặt hàng: ${err.message}`, variant: "danger" });
    }
  };

  const getProductDetails = (productId) => {
    return products.find((p) => p.id === productId) || { name: "Không rõ", price: 0 };
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">🛒 Giỏ hàng của bạn</h2>
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}
      {cartItems.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const product = getProductDetails(item.productId);
                return (
                  <tr key={item.productId}>
                    <td>{product.name}</td>
                    <td>{product.price.toLocaleString()}₫</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>{(product.price * item.quantity).toLocaleString()}₫</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={handleCheckout}>
              Thanh toán
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default Cart;