import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner, Row, Col, Card, Table } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';
import { Link } from 'react-router-dom';

const ShipperDashboard = () => {
    const { user } = useAuth();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchShipments = async () => {
            console.log('Fetching shipments for user:', user);
            if (!user || user.role !== 'shipper') {
                setError('Bạn không có quyền truy cập trang này.');
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/shipments?shipperId=${user.id}`);
                console.log('API response:', response.data);
                const shipmentsData = response.data;

                if (shipmentsData.length === 0) {
                    console.log('Không tìm thấy shipment nào cho shipper:', user.id);
                }

                const enrichedShipments = await Promise.all(
                    shipmentsData.map(async (shipment) => {
                        console.log('Processing shipment:', shipment.id);
                        const orderResponse = await api.get(`/orders/${shipment.orderId}`);
                        const order = orderResponse.data;

                        const orderDetailsResponse = await api.get(`/orderDetails?orderId=${shipment.orderId}`);
                        const orderDetails = orderDetailsResponse.data;

                        const products = await Promise.all(
                            orderDetails.map(async (detail) => {
                                const productResponse = await api.get(`/products/${detail.productId}`);
                                return { ...detail, product: productResponse.data };
                            })
                        );

                        const warehouseResponse = await api.get(`/warehouses/${shipment.sendWarehouseId}`);
                        const warehouse = warehouseResponse.data;

                        let buyer = null;
                        if (order.buyerId) {
                            const buyerResponse = await api.get(`/users/${order.buyerId}`);
                            buyer = buyerResponse.data;
                        }

                        return { ...shipment, order, products, warehouse, buyer };
                    })
                );

                setShipments(enrichedShipments);
                setLoading(false);
            } catch (err) {
                console.error('Lỗi khi lấy danh sách shipment:', err);
                setError('Không thể lấy danh sách shipment. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };

        fetchShipments();
    }, [user]);

    const getShipmentStats = (shipments) => {
        return {
            assigned: shipments.filter(s => s.status === 'assigned').length,
            inTransit: shipments.filter(s => s.status === 'in_transit').length,
            delivered: shipments.filter(s => s.status === 'delivered').length,
            total: shipments.length
        };
    };

    const stats = getShipmentStats(shipments);

    const getStatusText = (status) => {
        switch (status) {
            case 'in_transit':
                return 'Đang giao';
            case 'delivered':
                return 'Đã giao';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="mb-4">Shipper Dashboard</h2>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Row className="mb-4">
                <Col md={3} className="mb-3">
                    <Card className="text-center p-3 bg-primary text-white">
                        <Card.Title>Tổng Shipment</Card.Title>
                        <Card.Text>{stats.total}</Card.Text>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center p-3 bg-success text-white">
                        <Card.Title>Assigned</Card.Title>
                        <Card.Text>{stats.assigned}</Card.Text>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center p-3 bg-warning text-white">
                        <Card.Title>Đang Giao</Card.Title>
                        <Card.Text>{stats.inTransit}</Card.Text>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center p-3 bg-info text-white">
                        <Card.Title>Đã Giao</Card.Title>
                        <Card.Text>{stats.delivered}</Card.Text>
                    </Card>
                </Col>
            </Row>
            <h4 className="mb-3">Tổng Quan Shipment Được Giao</h4>
            {shipments.length === 0 ? (
                <Alert variant="info">Không có shipment nào được giao cho bạn.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Shipment ID</th>
                            <th>Order ID</th>
                            <th>Trạng Thái</th>
                            <th>Kho</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map((shipment) => (
                            <tr key={shipment.id}>
                                <td><Link to={`/shipper/shipment/${shipment.id}`}>#{shipment.id}</Link></td>
                                <td>#{shipment.orderId}</td>
                                <td>{getStatusText(shipment.status)}</td>
                                <td>{shipment.warehouse.name}</td>
                                <td><Link to={`/shipper/shipment/${shipment.id}`} className="btn btn-primary btn-sm">Xem Chi Tiết</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default ShipperDashboard;