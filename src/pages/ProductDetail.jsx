import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../auth/AuthProvider";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import axios from "axios";
import { useCart } from "../contexts/CartContext"; // Import useCart để cập nhật giỏ hàng

function ProductDetail() {
    const { id } = useParams(); // Lấy id từ URL
    const [product, setProduct] = useState(null);
    const [enterprise, setEnterprise] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const { updateCartItems } = useCart(); // Lấy hàm cập nhật giỏ hàng từ context

    // Lấy thông tin chi tiết sản phẩm
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProduct(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
            }
        };
        fetchProduct();
    }, [id, token]);

    // Khi có sản phẩm → Lấy thông tin công ty & sản phẩm cùng loại
    useEffect(() => {
        const fetchMoreInfo = async () => {
            if (!product) return;

            try {
                // Lấy tên công ty (từ warehouse → enterprise)
                const warehouseRes = await api.get(`/warehouses/${product.warehouseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const enterpriseRes = await api.get(`/enterprises/${warehouseRes.data.enterpriseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEnterprise(enterpriseRes.data);

                // Lấy các sản phẩm cùng loại (loại = productType, khác id hiện tại)
                const relatedRes = await api.get(`/products?productTypeId=${product.productTypeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const filtered = relatedRes.data.filter(p => p.id !== product.id);
                setRelatedProducts(filtered);

            } catch (err) {
                console.error("Lỗi khi lấy thông tin bổ sung:", err);
            }
        };
        fetchMoreInfo();
    }, [product, token]);

    if (!product) return <div>Đang tải sản phẩm...</div>;

    const handleAddToCart = async (productId) => {
        if (!user) {
            navigate("/auth/login", { state: { from: location.pathname } });
            return;
        }

        try {
            // 1. Kiểm tra user đã có giỏ hàng chưa
            const cartRes = await axios.get(`http://localhost:9999/carts?userID=${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Nếu giỏ hàng đã tồn tại
            if (cartRes.data.length > 0) {
                const cart = cartRes.data[0];
                const existingItem = cart.items.find(item => item.productID === productId);

                let updatedItems;
                if (existingItem) {
                    // Nếu sản phẩm đã có → tăng số lượng
                    updatedItems = cart.items.map(item =>
                        item.productID === productId
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    // Nếu sản phẩm chưa có → thêm mới vào items
                    updatedItems = [...cart.items, { productID: productId, quantity: 1 }];

                    
                }

                // 2. Gửi PATCH để cập nhật toàn bộ items
                await axios.patch(`http://localhost:9999/carts/${cart.id}`, {
                    items: updatedItems
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                updateCartItems(); // Cập nhật số lượng item trong giỏ hàng
                alert("Đã cập nhật giỏ hàng");
            } else {
                // Nếu chưa có giỏ hàng → tạo mới
                await axios.post(`http://localhost:9999/carts`, {
                    userID: user.id,
                    items: [
                        {
                            productID: productId,
                            quantity: 1
                        }
                    ]
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                alert("Đã tạo mới giỏ hàng và thêm sản phẩm");
                updateCartItems(); // Cập nhật số lượng item trong giỏ hàng
            }
        } catch (err) {
            console.error("Lỗi khi thêm vào giỏ hàng:", err);
            alert("Có lỗi xảy ra khi thêm vào giỏ hàng");
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                <a
                    href="#"
                    onClick={e => {
                        e.preventDefault();
                        navigate("/");
                    }}
                    style={{
                        display: "inline-block",
                        marginBottom: "16px",
                        color: "#007bff",
                        textDecoration: "underline",
                        cursor: "pointer"
                    }}
                >
                    Về trang chủ
                </a>
            </Row>
            <br />
            <h2>{product.name}</h2>
            <Row className="mb-4">
                <Col md={5}>
                    <div
                        style={{
                            width: "100%",
                            height: "400px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #222",
                            borderRadius: "8px",
                            background: "#fff"
                        }}
                    >
                        <Card.Img
                            src={product.src || `../../public/assets/images/products/${product.id}.jpg`} // Sử dụng src từ database
                            alt={product.name}
                            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
                        />
                    </div>
                </Col>
                <Col md={7}>
                    <h4>Mô tả:</h4>
                    <p>{product.description}</p>
                    <h5>Giá: {product.price?.toLocaleString()}₫</h5>
                    <br />
                    <br />
                    <br />
                    <Card.Text>
                        <button onClick={() => handleAddToCart(product.id)} className="btn btn-success">Thêm vào giỏ hàng</button>
                    </Card.Text>
                </Col>
            </Row>
            <hr />
            {enterprise && (
                <Row className="mb-3">
                    <Col>
                        <strong>Công ty:</strong>{" "}
                        <Button
                            variant="link"
                            className="p-0"
                            onClick={() => navigate(`/enterprise/${enterprise.id}`)}
                        >
                            {enterprise.name}
                        </Button>
                    </Col>
                </Row>
            )}
            <hr />

            <h4>Sản phẩm cùng loại</h4>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {relatedProducts.map((p) => (
                    <Col key={p.id}>
                        <Card
                            className="product-card card-hover"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/product/${p.id}`)}
                        >
                            <Card.Img
                                variant="top"
                                src={p.src || `../../public/assets/images/products/${p.id}.jpg`} // Sử dụng src từ database
                                alt={p.name}
                                style={{
                                    height: "150px",
                                    width: "100%",
                                    objectFit: "contain",
                                    backgroundColor: "#f8f9fa",
                                    padding: "5px"
                                }}
                            />
                            <Card.Body>
                                <Card.Title>{p.name}</Card.Title>
                                <Card.Subtitle className="text-muted">
                                    {p.price?.toLocaleString()}₫
                                </Card.Subtitle>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default ProductDetail;
