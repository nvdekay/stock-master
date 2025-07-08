import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Row, Col } from "react-bootstrap";
import '../assets/css/ProductList.css';


function ProductList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:9999/products")
            .then(res => setProducts(res.data))
            .catch(err => console.error("Lỗi khi fetch sản phẩm:", err));
    }, []);

    return (
        <Container className="mt-4">
            <h2 className="mb-4">🛒 Danh sách sản phẩm</h2>

            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {products.map((product) => (
                    <Col key={product.id}>
                        <Card className="card-hover">
                            <Card.Body>
                                <Card.Img
                                    variant="top"
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                        height: "200px",          // Chiều cao cố định
                                        width: "100%",            // Ngang theo thẻ cha (Card)
                                        objectFit: "contain",     // Giữ nguyên tỉ lệ ảnh, không crop
                                        backgroundColor: "#f8f9fa", // Màu nền làm "khung"
                                        padding: "10px"           // Tạo khoảng cách nhẹ bên trong
                                    }}
                                />

                                <Card.Title>{product.name}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    {product.price.toLocaleString()}₫
                                </Card.Subtitle>
                                <Card.Text>{product.description}</Card.Text>
                                <Card.Text>
                                    <strong>Trạng thái:</strong> {renderStatus(product.status)}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

// Hàm chuyển trạng thái sang biểu tượng dễ hiểu
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

export default ProductList;
