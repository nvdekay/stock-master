import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../auth/AuthProvider";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

function ProductDetail() {
    const { id } = useParams(); // Lấy id từ URL
    const [product, setProduct] = useState(null);
    const [enterprise, setEnterprise] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { user, token } = useAuth();
    const navigate = useNavigate();

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
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const checkRes = await api.get(
                `/carts?userId=${user.id}&productId=${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (checkRes.data.length > 0) {
                // Nếu đã có, tăng quantity
                const existingItem = checkRes.data[0];
                await api.patch(`/carts/${existingItem.id}`, {
                    quantity: existingItem.quantity + 1
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                alert("Đã cập nhật số lượng sản phẩm có sẵn trong giỏ hàng");
            } else {
                // Nếu chưa có, thêm mới
                await api.post("/carts", {
                    userId: user.id,
                    productId: productId,
                    quantity: 1
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                alert("Đã thêm sản phẩm vào giỏ hàng");
            }
        } catch (err) {
            console.error("Lỗi khi thêm/cập nhật giỏ hàng:", err);
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
