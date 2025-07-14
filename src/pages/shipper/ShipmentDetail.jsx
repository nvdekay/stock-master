import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import ShipmentCard from '../../components/shipper/ShipmentCard';
import DeliveryProgress from '../../components/shipper/DeliveryProgress';

const ShipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchShipment = async () => {
            console.log('Fetching shipment with ID:', id);
            try {
                const response = await api.get(`/shipments/${id}`);
                console.log('Shipment data:', response.data);
                const shipmentData = response.data;

                const orderResponse = await api.get(`/orders/${shipmentData.orderId}`);
                console.log('Order data:', orderResponse.data);
                const order = orderResponse.data;

                const orderDetailsResponse = await api.get(`/orderDetails?orderId=${shipmentData.orderId}`);
                console.log('Order details data:', orderDetailsResponse.data);
                const orderDetails = orderDetailsResponse.data;

                const products = await Promise.all(
                    orderDetails.map(async (detail) => {
                        const productResponse = await api.get(`/products/${detail.productId}`);
                        console.log(`Product data for ID ${detail.productId}:`, productResponse.data);
                        return { ...detail, product: productResponse.data };
                    })
                );

                const warehouseResponse = await api.get(`/warehouses/${shipmentData.sendWarehouseId}`);
                console.log('Warehouse data:', warehouseResponse.data);
                const warehouse = warehouseResponse.data;

                let buyer = null;
                if (order.buyerId) {
                    const buyerResponse = await api.get(`/users/${order.buyerId}`);
                    console.log('Buyer data:', buyerResponse.data);
                    buyer = buyerResponse.data;
                }

                setShipment({ ...shipmentData, order, products, warehouse, buyer });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching shipment:', err.response ? err.response.data : err.message);
                setError('Failed to fetch shipment details. Please try again later.');
                setLoading(false);
            }
        };

        fetchShipment();
    }, [id]);

    const handleStatusUpdate = async (shipmentId, newStatus) => {
        try {
            await api.patch(`/shipments/${shipmentId}`, {
                status: newStatus,
                deliveryDate: newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : null,
            });

            const shipmentCopy = { ...shipment };
            if (newStatus === 'delivered') {
                await api.patch(`/orders/${shipmentCopy.orderId}`, { status: 'completed' });
            }

            setShipment((prev) => ({
                ...prev,
                status: newStatus,
                deliveryDate: newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : prev.deliveryDate
            }));
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

    if (!shipment) {
        return (
            <Container>
                <Alert variant="warning">Shipment not found.</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="mb-4">Shipment Details</h2>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <DeliveryProgress status={shipment.status} />

            <ShipmentCard shipment={shipment} handleStatusUpdate={handleStatusUpdate} />
            <div className="text-end mt-3">
                <Button variant="secondary" onClick={() => navigate('/shipper')}>
                    Quay Lại Dashboard
                </Button>            </div>
        </Container>
    );
};

export default ShipmentDetail;