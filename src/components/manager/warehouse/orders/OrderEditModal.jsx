import { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Alert, Card, ListGroup, Table, Spinner } from 'react-bootstrap';
import api from '../../../../api/axiosInstance';

function OrderEditModal({ show, onHide, order, onSuccess }) {
    
    const [formData, setFormData] = useState({
        status: '',
        note: ''
    });
    const [orderDetails, setOrderDetails] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (show && order) {
            setFormData({
                status: order.status || '',
                note: order.note || ''
            });
            fetchOrderDetails();
            setError('');
            setSuccess('');
        }
    }, [show, order]);

    const fetchOrderDetails = async () => {
        if (!order) return;
        
        try {
            const detailsResponse = await api.get(`/orderDetails?orderId=${order.id}`);
            const details = detailsResponse.data;
            setOrderDetails(details);
            
            if (details.length > 0) {
                const productIds = [...new Set(details.map(d => d.productId))];
                const productRequests = productIds.map(id => api.get(`/products/${id}`));
                const productResponses = await Promise.all(productRequests);
                const relatedProducts = productResponses.map(res => res.data);
                setProducts(relatedProducts);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.status) {
            setError('Please select a status.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Chỉ cập nhật status và note
            await api.patch(`/orders/${order.id}`, {
                status: formData.status,
                note: formData.note
            });

            setSuccess('Order updated successfully!');
            setTimeout(() => {
                onHide();
                if (onSuccess) onSuccess();
            }, 1500);

        } catch (err) {
            console.error('Error updating order:', err);
            setError(err.response?.data?.error || 'Failed to update order');
        } finally {
            setLoading(false);
        }
    };

    const getProductInfo = (productId) => products.find(p => p.id === productId) || { name: 'Unknown Product' };
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const calculatedTotal = orderDetails.reduce((sum, detail) => sum + ((detail.price || 0) * (detail.quantity || 0)), 0);

    if (!order) return null;

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-edit me-2"></i>
                    Edit Order - #{order.id}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Row>
                    <Col md={6} className="mb-4 mb-md-0">
                        <Card className="h-100">
                            <Card.Header><h6 className="mb-0">Update Order</h6></Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label><strong>Order Status *</strong></Form.Label>
                                        <Form.Select
                                            value={formData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="">-- Select Status --</option>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="in_transit">In Transit</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label><strong>Note</strong></Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            value={formData.note}
                                            onChange={(e) => handleInputChange('note', e.target.value)}
                                            placeholder="Enter any notes for this order"
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="h-100">
                            <Card.Header><h6 className="mb-0">Party Information</h6></Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    {order.type === 'wholesale' ? (
                                        <>
                                            <ListGroup.Item>
                                                <strong>Buyer:</strong>
                                                <div>{order.buyer?.fullName || `Buyer ID: ${order.buyerId}`}</div>
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>Shipper:</strong>
                                                <div>{order.shipper?.fullName || (order.shipment ? 'Not assigned' : 'No shipment')}</div>
                                            </ListGroup.Item>
                                        </>
                                    ) : (
                                        <>
                                            <ListGroup.Item><strong>Sender:</strong> <div>{order.senderStaff?.fullName}</div></ListGroup.Item>
                                            <ListGroup.Item><strong>Receiver:</strong> <div>{order.receiverStaff?.fullName || 'N/A'}</div></ListGroup.Item>
                                            <ListGroup.Item><strong>From:</strong> <div>{order.sendWarehouse?.name}</div></ListGroup.Item>
                                            <ListGroup.Item><strong>To:</strong> <div>{order.receiveWarehouse?.name}</div></ListGroup.Item>
                                        </>
                                    )}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} className="mt-4">
                        <Card>
                            <Card.Header><h6 className="mb-0">Order Items (Read-only)</h6></Card.Header>
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Product</th>
                                        <th className="text-end">Unit Price</th>
                                        <th className="text-center">Quantity</th>
                                        <th className="text-end">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderDetails.length > 0 ? orderDetails.map((detail) => {
                                        const product = getProductInfo(detail.productId);
                                        return (
                                            <tr key={detail.id}>
                                                <td>{product.name}</td>
                                                <td className="text-end">{formatCurrency(detail.price)}</td>
                                                <td className="text-center fw-bold">{detail.quantity}</td>
                                                <td className="text-end fw-bold">{formatCurrency(detail.price * detail.quantity)}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="4" className="text-center py-4 text-muted">No items in this order.</td></tr>
                                    )}
                                </tbody>
                                {orderDetails.length > 0 && (
                                    <tfoot className="bg-light-subtle border-top">
                                        <tr>
                                            <th colSpan="3" className="text-end fs-5">Total Amount:</th>
                                            <th className="text-end fs-5 text-primary">{formatCurrency(calculatedTotal)}</th>
                                        </tr>
                                    </tfoot>
                                )}
                            </Table>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : <i className="fas fa-save me-2"></i>}
                    {loading ? ' Saving...' : ' Save Changes'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default OrderEditModal;