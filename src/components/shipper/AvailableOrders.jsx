import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner, Table, Button } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

const AvailableOrders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            console.log('Fetching available orders for user:', user);
            if (!user || user.role !== 'shipper') {
                setError('Bạn không có quyền truy cập trang này.');
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/orders?status=ready`);
                console.log('API response:', response.data);
                const ordersData = response.data;

                if (ordersData.length === 0) {
                    console.log('Không tìm thấy đơn hàng nào ở trạng thái ready.');
                }

                const enrichedOrders = await Promise.all(
                    ordersData.map(async (order) => {
                        console.log('Processing order:', order.id);
                        const orderDetailsResponse = await api.get(`/orderDetails?orderId=${order.id}`);
                        const orderDetails = orderDetailsResponse.data;

                        const products = await Promise.all(
                            orderDetails.map(async (detail) => {
                                const productResponse = await api.get(`/products/${detail.productId}`);
                                return { ...detail, product: productResponse.data };
                            })
                        );

                        const warehouseResponse = await api.get(`/warehouses/${order.sendWarehouseId}`);
                        const warehouse = warehouseResponse.data;

                        let buyer = null;
                        if (order.buyerId) {
                            const buyerResponse = await api.get(`/users/${order.buyerId}`);
                            buyer = buyerResponse.data;
                        }

                        return { ...order, products, warehouse, buyer };
                    })
                );

                setOrders(enrichedOrders);
                setLoading(false);
            } catch (err) {
                console.error('Lỗi khi lấy danh sách đơn hàng:', err);
                setError('Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const handleAssignOrder = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}`, {
                status: 'in_transit'
            });

            const newShipment = {
                orderId: orderId,
                shipperId: user.id,
                sendWarehouseId: orders.find(o => o.id === orderId).sendWarehouseId,
                status: 'in_transit',
                note: `Giao hàng cho đơn #${orderId}`
            };
            await api.post('/shipments', newShipment);

            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            setSuccessMessage(`Đơn hàng #${orderId} đã được nhận và chuyển sang trạng thái in_transit!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Lỗi khi nhận đơn hàng:', err.response ? err.response.data : err.message);
            setError('Không thể nhận đơn hàng. Vui lòng thử lại.');
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
            <h2 className="mb-4">Danh Sách Đơn Hàng Có Sẵn</h2>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {orders.length === 0 ? (
                <Alert variant="info">Không có đơn hàng nào ở trạng thái ready.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Đơn Hàng ID</th>
                            <th>Ngày Tạo</th>
                            <th>Kho Gửi</th>
                            <th>Người Mua</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.date}</td>
                                <td>{order.warehouse.name}</td>
                                <td>{order.buyer ? order.buyer.fullName : 'N/A'}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleAssignOrder(order.id)}
                                        className="btn-sm"
                                    >
                                        Nhận Đơn
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <div className="text-end mt-3">
                <Button variant="secondary" onClick={() => navigate('/shipper')}>
                    Quay Lại Dashboard
                </Button>
            </div>
        </Container>
    );
};

export default AvailableOrders;