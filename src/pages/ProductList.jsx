import { useEffect, useState } from "react";
import { Card, Container, Row, Col, Form, FormControl } from "react-bootstrap";
import '../../public/assets/css/ProductList.css';
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../auth/AuthProvider';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [productTypes, setProductTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // asc = từ thấp đến cao (mặc định)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resProducts = await api.get("/products");
                const resTypes = await api.get("/product_types");

                if (resProducts && resTypes) {
                    let fetchedProducts = resProducts.data;

                    // Áp dụng sort ngay khi fetch
                    if (sortOrder === "asc") {
                        fetchedProducts.sort((a, b) => a.price - b.price);
                    } else {
                        fetchedProducts.sort((a, b) => b.price - a.price);
                    }

                    setProducts(fetchedProducts);
                    setAllProducts(fetchedProducts);
                    setProductTypes(resTypes.data);
                }
            } catch (err) {
                console.error("Lỗi khi fetch sản phẩm hoặc loại sản phẩm:", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...allProducts];

        if (search.trim() !== "") {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (selectedType !== "") {
            filtered = filtered.filter(product =>
                product.productTypeId === parseInt(selectedType)
            );
        }

        if (sortOrder === "asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else {
            filtered.sort((a, b) => b.price - a.price);
        }

        setProducts(filtered);
    }, [search, selectedType, sortOrder]);

    const { user, token } = useAuth();
    const navigate = useNavigate();

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

    const handleProductDetail = (id) => {
        if (!user) {
            navigate("/auth/login", { state: { from: location.pathname } });
            return;
        }
        navigate(`/product/${id}`)
    }

    return (
        <Container className="mt-4">
            <Form className="mb-4">
                <Row className="g-3">
                    <Col md={5}>
                        <FormControl
                            placeholder="Tìm kiếm tên sản phẩm"
                            onChange={e => setSearch(e.target.value)}
                        />
                    </Col>

                    <Col md={4}>
                        <Form.Select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                        >
                            <option value="">-- Tất cả loại sản phẩm --</option>
                            {productTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>

                    <Col md={3}>
                        <Form.Check
                            type="radio"
                            name="sort"
                            label="Giá tăng dần"
                            value="asc"
                            checked={sortOrder === "asc"}
                            onChange={(e) => setSortOrder(e.target.value)}
                        />
                        <Form.Check
                            type="radio"
                            name="sort"
                            label="Giá giảm dần"
                            value="desc"
                            checked={sortOrder === "desc"}
                            onChange={(e) => setSortOrder(e.target.value)}
                        />
                    </Col>
                </Row>
            </Form>

            <h2 className="mb-4">Danh sách sản phẩm</h2>

            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {products.map((product) => (
                    <Col key={product.id}>
                        <Card
                            className="card-hover product-card"
                            style={{ cursor: "pointer" }}>
                            <Card.Body onClick={() => handleProductDetail(product.id)}>
                                <Card.Img
                                    variant="top"
                                    src={`../../public/assets/images/products/${product.id}.jpg`}
                                    alt={product.name}
                                    style={{
                                        height: "200px",
                                        width: "100%",
                                        objectFit: "contain",
                                        backgroundColor: "#f8f9fa",
                                        padding: "10px"
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
                                    <button onClick={() => handleAddToCart(product.id)} className="btn btn-success">Thêm vào giỏ hàng</button>
                                </Card.Text>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container >
    );
}


export default ProductList;
