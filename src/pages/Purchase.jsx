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
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, enterpriseRes, locationRes] = await Promise.all([
                    axios.get("http://localhost:9999/products", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:9999/enterprises", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`http://localhost:9999/locations?userId=${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);
                setProducts(productRes.data);
                setEnterprises(enterpriseRes.data);
                setLocations(locationRes.data);
                if (locationRes.data.length > 0) {
                    setAddress(locationRes.data[0].location);
                }
            } catch (error) {
                console.error("Lỗi khi load dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.id, token]);

    const getProductById = (id) => products.find(p => p.id === id);
    const getEnterpriseName = (enterpriseId) => {
        const e = enterprises.find(en => en.id === enterpriseId);
        return e ? e.name : "Không rõ";
    };

    const updateQuantity = (productId, newQuantity) => {
        const product = getProductById(productId);
        if (!product) return;

        const max = product.quantity || 0;
        if (newQuantity < 1 || newQuantity > max) return;

        const updatedItems = itemsToPurchase.map(item =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
        setItemsToPurchase(updatedItems);
    };

    const handleRemove = (productId) => {
        if (!window.confirm("Bạn có chắc xoá sản phẩm này khỏi đơn hàng?")) return;
        const updated = itemsToPurchase.filter(item => item.productId !== productId);
        setItemsToPurchase(updated);
    };

    const handlePurchase = async () => {
        if (!address.trim()) {
            alert("Vui lòng nhập địa chỉ giao hàng");
            return;
        }

        const groupedItems = {};
        for (const item of itemsToPurchase) {
            const product = getProductById(item.productId);
            if (!product) continue;
            const warehouseId = product.warehouseId;

            if (!groupedItems[warehouseId]) groupedItems[warehouseId] = [];
            groupedItems[warehouseId].push({ ...item, product });
        }

        try {
            for (const warehouseId in groupedItems) {
                const items = groupedItems[warehouseId];
                const orderRes = await axios.post("http://localhost:9999/orders", {
                    buyerId: user.id,
                    type: "wholesale",
                    status: "pending",
                    date: new Date().toISOString().split("T")[0],
                    sendWarehouseId: warehouseId,
                    note: `Đơn sỉ từ kho ${warehouseId} cho ${user.username} - Địa chỉ: ${address}`
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const orderId = orderRes.data.id;

                for (const item of items) {
                    if (item.quantity > item.product.quantity) {
                        alert(`Sản phẩm ${item.product.name} không đủ hàng`);
                        continue;
                    }

                    await axios.post("http://localhost:9999/orderDetails", {
                        orderId,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }

            if (locations.length === 0) {
                await axios.post("http://localhost:9999/locations", {
                    userId: user.id,
                    location: address
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

    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <Container className="mt-4">
            <h2>Xác nhận đơn hàng</h2>
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
                                            {getEnterpriseName(product.warehouseId)}
                                        </Card.Subtitle>
                                        <Card.Text>Kho: {product.warehouseId}</Card.Text>
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
                                                disabled={item.quantity >= (product.quantity || 0)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <br />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemove(item.productId)}
                                        >
                                            Xoá khỏi đơn hàng
                                        </Button>
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
                    {locations.length > 0 ? (
                        <Form.Select value={address} onChange={(e) => setAddress(e.target.value)}>
                            <option value="">-- Chọn địa chỉ --</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.location}>{loc.location}</option>
                            ))}
                        </Form.Select>
                    ) : (
                        <Form.Control
                            type="text"
                            placeholder="Bạn chưa có địa chỉ, vui lòng nhập để lưu vào hệ thống"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    )}
                </Form.Group>
                <Button variant="success" onClick={handlePurchase}>Xác nhận mua hàng</Button>
            </Form>
        </Container>
    );
}

export default PurchasePage;
