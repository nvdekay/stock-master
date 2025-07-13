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
                setError('You are not authorized to view this page.');
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/shipments?shipperId=${user.id}`);
                console.log('API response:', response.data);
                const shipmentsData = response.data;

                if (shipmentsData.length === 0) {
                    console.log('No shipments found for shipper:', user.id);
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
                console.error('Error fetching shipments:', err);
                setError('Failed to fetch shipments. Please try again later.');
                setLoading(false);
            }
        };

        fetchShipments();
    }, [user]);

    // Thống kê số lượng shipment theo trạng thái
    const getShipmentStats = (shipments) => {
        return {
            assigned: shipments.filter(s => s.status === 'assigned').length,
            inTransit: shipments.filter(s => s.status === 'in_transit').length,
            delivered: shipments.filter(s => s.status === 'delivered').length,
            total: shipments.length
        };
    };

    const stats = getShipmentStats(shipments);

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
                        <Card.Title>Total Shipments</Card.Title>
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
                        <Card.Title>In Transit</Card.Title>
                        <Card.Text>{stats.inTransit}</Card.Text>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center p-3 bg-info text-white">
                        <Card.Title>Delivered</Card.Title>
                        <Card.Text>{stats.delivered}</Card.Text>
                    </Card>
                </Col>
            </Row>
            <h4 className="mb-3">Assigned Shipments Overview</h4>
            {shipments.length === 0 ? (
                <Alert variant="info">No shipments assigned to you.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Shipment ID</th>
                            <th>Order ID</th>
                            <th>Status</th>
                            <th>Warehouse</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map((shipment) => (
                            <tr key={shipment.id}>
                                <td><Link to={`/shipper/shipment/${shipment.id}`}>#{shipment.id}</Link></td>
                                <td>#{shipment.orderId}</td>
                                <td>{shipment.status}</td>
                                <td>{shipment.warehouse.name}</td>
                                <td><Link to={`/shipper/shipment/${shipment.id}`} className="btn btn-primary btn-sm">View Details</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default ShipperDashboard;