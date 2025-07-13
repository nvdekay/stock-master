// src/components/admin/warehouse/WarehouseDetail.jsx
import { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { Card, Button, Table, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';

const WarehouseDetail = ({ warehouse, enterprises, onBack }) => {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInventoryAndProducts();
    }, [warehouse.id]);

    const fetchInventoryAndProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const [inventoryRes, productsRes] = await Promise.all([
                api.get(`/inventory?warehouseId=${warehouse.id}`),
                api.get('/products')
            ]);
            setInventory(inventoryRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            console.error('Lỗi khi lấy dữ liệu tồn kho và sản phẩm:', err);
            setError('Không thể tải chi tiết tồn kho. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Không xác định';
    };

    const getEnterpriseName = (enterpriseId) => {
        const enterprise = enterprises.find(e => e.id === enterpriseId);
        return enterprise ? enterprise.name : 'N/A';
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Chi tiết Kho hàng: {warehouse.name}</h5>
                <Button variant="outline-secondary" size="sm" onClick={onBack}>
                    <ArrowLeft size={16} className="me-1" /> Quay lại
                </Button>
            </Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col md={6}>
                        <p><strong>ID:</strong> {warehouse.id}</p>
                        <p><strong>Địa điểm:</strong> {warehouse.location}</p>
                    </Col>
                    <Col md={6}>
                        <p><strong>Doanh nghiệp:</strong> {getEnterpriseName(warehouse.enterpriseId)}</p>
                    </Col>
                </Row>

                <h5 className="mt-4 mb-3">Sản phẩm trong kho:</h5>
                {loading && (
                    <div className="text-center my-3">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Đang tải tồn kho...</span>
                        </Spinner>
                    </div>
                )}
                {error && <Alert variant="danger">{error}</Alert>}

                {!loading && !error && (
                    inventory.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID Sản phẩm</th>
                                    <th>Tên Sản phẩm</th>
                                    <th>Số lượng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.productId}</td>
                                        <td>{getProductName(item.productId)}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert variant="info" className="mb-0">
                            Kho hàng này hiện không có sản phẩm nào.
                        </Alert>
                    )
                )}
            </Card.Body>
        </Card>
    );
};

export default WarehouseDetail;