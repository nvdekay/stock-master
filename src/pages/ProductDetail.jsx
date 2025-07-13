import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Image, Button, Alert } from "react-bootstrap";
import api from "../api/axiosInstance";

function ProductDetail() {
    const { id } = useParams(); // Lấy id từ URL
    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                setError("Không tìm thấy sản phẩm.");
                console.error(err);
            }
        };

        fetchProduct();
    }, [id]);

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container className="mt-5">
                <p>Đang tải thông tin sản phẩm...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row>
                <Col md={6}>
                    <Image
                        src={`../../public/assets/images/products/${product.id}.jpg`}
                        alt={product.name}
                        fluid
                        style={{
                            backgroundColor: "#f5f5f5",
                            objectFit: "contain",
                            padding: "10px",
                            width: "100%",
                            maxHeight: "400px"
                        }}
                    />
                </Col>
                <Col md={6}>
                    <h2>{product.name}</h2>
                    <h4 className="text-muted">{product.price?.toLocaleString()}₫</h4>
                    <p className="mt-3">{product.description}</p>

                    <p>
                        <strong>Trạng thái: </strong>
                        {renderStatus(product.status)}
                    </p>

                    <Button variant="primary" className="me-2">
                        Thêm vào giỏ hàng
                    </Button>
                    <Button variant="outline-secondary">Mua ngay</Button>
                </Col>
            </Row>
        </Container>
    );
}

function renderStatus(status) {
    switch (status) {
        case "available":
            return "✅ Hàng có sẵn";
        case "expired":
            return "⚠️ Hết bảo hành";
        case "out-of-stock":
            return "❌ Hết hàng";
        default:
            return "Không rõ";
    }
}

export default ProductDetail;
