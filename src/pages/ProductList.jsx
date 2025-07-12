import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Row, Col, Form, FormControl } from "react-bootstrap";
import '../../public/assets/css/ProductList.css';
import api from "../api/axiosInstance";


function ProductList() {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        // axios.get("http://localhost:9999/products")
        //     .then(res => setProducts(res.data))
        //     .catch(err => console.error("Lỗi khi fetch sản phẩm:", err));
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products");
                if (response) {
                    setProducts(response.data);
                    setAllProducts(response.data);
                }
            } catch (err) {
                console.log("Lỗi khi fetch sản phẩm:", err);
            }
        };
        fetchProducts();
    }, []);


    useEffect(() => {
        if (search == "") {
            setProducts(allProducts);
        } else {
            let searched_product = allProducts;
            searched_product = searched_product.filter(product => 
                product.name.toLowerCase().includes(search.toLowerCase())
            )
            setProducts(searched_product);
        }
    }, [search])

    return (
        <Container className="mt-4">
            <Form>
                <FormControl placeholder="Tìm kiếm tên sản phẩm" onChange={e => setSearch(e.target.value)}></FormControl>
            </Form>

            <h2 className="mb-4">Danh sách sản phẩm</h2>

            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {products.map((product) => (
                    <Col key={product.id}>



                        <Card className="card-hover product-card">
                            <Card.Body>
                                <Card.Img
                                    variant="top"
                                    src={`../../public/assets/images/products/${product.id}.jpg`}
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
                                    {product.price?.toLocaleString()}₫
                                </Card.Subtitle>
                                <Card.Text>{product.description}</Card.Text>

                            </Card.Body>

                            <Card.Footer className="product-footer">
                                <Card.Text>
                                    <strong>Trạng thái:</strong> {renderStatus(product.status)}
                                </Card.Text>
                            </Card.Footer>
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
