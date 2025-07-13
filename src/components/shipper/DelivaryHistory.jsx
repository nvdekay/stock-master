import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner, Row, Button } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';
import ShipmentCard from '../../components/shipper/ShipmentCard';

const DeliveryHistory = () => {
    const { user } = useAuth();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchShipments = async () => {
            console.log('Fetching delivery history for user:', user);
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
                setError('Failed to fetch delivery history. Please try again later.');
                setLoading(false);
            }
        };

        fetchShipments();
    }, [user]);

    const handleStatusUpdate = async (shipmentId, newStatus) => {
        try {
            await api.patch(`/shipments/${shipmentId}`, {
                status: newStatus,
                deliveryDate: newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : null,
            });

            const shipmentCopy = shipments.find(s => s.id === shipmentId);
            if (newStatus === 'delivered') {
                await api.patch(`/orders/${shipmentCopy.orderId}`, { status: 'completed' });
            }

            setShipments((prev) =>
                prev.map((s) =>
                    s.id === shipmentId
                        ? {
                            ...s,
                            status: newStatus,
                            deliveryDate: newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : s.deliveryDate,
                        }
                        : s
                )
            );
            setSuccessMessage(`Shipment ${shipmentId} updated to ${newStatus}!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating shipment:', err.response ? err.response.data : err.message);
            setError('Failed to update shipment status. Please try again.');
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
            <h2 className="mb-4">Delivery History</h2>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {shipments.length === 0 ? (
                <Alert variant="info">No shipments found in history.</Alert>
            ) : (
                <Row>
                    {shipments.map((shipment) => (
                        <ShipmentCard key={shipment.id} shipment={shipment} handleStatusUpdate={handleStatusUpdate} />
                    ))}
                </Row>
            )}
            <div className="text-end mt-3">
                <Button variant="secondary" onClick={() => navigate('/shipper')}>Back to Dashboard</Button>
            </div>
        </Container>
    );
};

export default DeliveryHistory;