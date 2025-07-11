import { useState, useEffect } from 'react';
import { Modal, Row, Col, Card, Button, Badge, Table, ListGroup, Spinner } from 'react-bootstrap';
import api from '../../../../api/axiosInstance';

function OrderViewModal({ show, onHide, order, onEdit }) {
    const [orderDetails, setOrderDetails] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && order) {
            fetchOrderDetails();
        } else {
            setOrderDetails([]);
            setProducts([]);
        }
    }, [show, order]);

    const fetchOrderDetails = async () => {
        if (!order) return;
        
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const getTypeBadge = (type) => {
        const typeKey = order?.historyType || order?.type;
        const typeConfig = {
            import: { bg: 'success', text: 'Import', icon: 'fa-arrow-down' },
            export: { bg: 'primary', text: 'Export', icon: 'fa-arrow-up' },
            transfer: { bg: 'info', text: 'Transfer', icon: 'fa-exchange-alt' },
            wholesale: { bg: 'warning', text: 'Wholesale', icon: 'fa-handshake' }
        };
        const config = typeConfig[typeKey] || { bg: 'secondary', text: typeKey, icon: 'fa-question' };
        return <Badge bg={config.bg}><i className={`fas ${config.icon} me-1`}></i>{config.text}</Badge>;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'warning', text: 'Pending' },
            processing: { bg: 'info', text: 'Processing' },
            in_transit: { bg: 'primary', text: 'In Transit' },
            shipped: { bg: 'primary', text: 'Shipped' },
            completed: { bg: 'success', text: 'Completed' },
            cancelled: { bg: 'danger', text: 'Cancelled' }
        };
        const config = statusConfig[status] || { bg: 'secondary', text: status };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getProductInfo = (productId) => {
        return products.find(p => p.id === productId) || { name: 'Unknown Product', description: '' };
    };

    if (!order) return null;

    const calculatedTotal = orderDetails.reduce((sum, detail) => {
        const price = detail.price || 0;
        const quantity = detail.quantity || 0;
        return sum + (price * quantity);
    }, 0);

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-file-invoice-dollar me-2"></i>
                    Order Details - #{order.id}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Loading details...</p>
                    </div>
                ) : (
                    <Row>
                        <Col md={6} className="mb-4 mb-md-0">
                            <Card className="h-100">
                                <Card.Header><h6 className="mb-0">Order Information</h6></Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="d-flex justify-content-between">
                                            <strong>Order ID:</strong>
                                            <span>#{order.id}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                            <strong>Type:</strong>
                                            {getTypeBadge()}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                            <strong>Status:</strong>
                                            {getStatusBadge(order.status)}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between">
                                            <strong>Order Date:</strong>
                                            <span>{new Date(order.date).toLocaleDateString('vi-VN')}</span>
                                        </ListGroup.Item>
                                        {order.status === 'completed' && order.shipment?.deliveryDate && (
                                            <ListGroup.Item className="d-flex justify-content-between text-success">
                                                <strong>Delivered Date:</strong>
                                                <span className="fw-bold">
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    {new Date(order.shipment.deliveryDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            </ListGroup.Item>
                                        )}
                                        {order.note && (
                                            <ListGroup.Item>
                                                <strong>Note:</strong>
                                                <p className="text-muted mb-0">{order.note}</p>
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Header>
                                    <h6 className="mb-0">
                                        {order.type === 'wholesale' ? 'Participants' : 'Staff & Warehouse'} Information
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                     <ListGroup variant="flush">
                                        {order.type === 'wholesale' ? (
                                            <>
                                                <ListGroup.Item>
                                                    <strong>Buyer:</strong>
                                                    <div>{order.buyer?.fullName || `Buyer ID: ${order.buyerId}`}</div>
                                                    <small className="text-muted">{order.buyer?.email}</small>
                                                </ListGroup.Item>
                                                <ListGroup.Item>
                                                    <strong>Shipper:</strong>
                                                    <div>{order.shipper?.fullName || (order.shipment ? 'Not assigned' : 'No shipment created')}</div>
                                                </ListGroup.Item>
                                            </>
                                        ) : (
                                            <>
                                                <ListGroup.Item>
                                                    <strong>Sender Staff:</strong>
                                                    <div>{order.senderStaff?.fullName || `Staff ID: ${order.senderStaffId}`}</div>
                                                </ListGroup.Item>
                                                <ListGroup.Item>
                                                    <strong>Receiver Staff:</strong>
                                                    <div>{order.receiverStaff?.fullName || (order.receiverStaffId ? `Staff ID: ${order.receiverStaffId}` : 'N/A')}</div>
                                                </ListGroup.Item>
                                                <ListGroup.Item>
                                                    <strong>Send Warehouse:</strong>
                                                    <div>{order.sendWarehouse?.name || `Warehouse ID: ${order.sendWarehouseId}`}</div>
                                                </ListGroup.Item>
                                                <ListGroup.Item>
                                                    <strong>Receive Warehouse:</strong>
                                                    <div>{order.receiveWarehouse?.name || `Warehouse ID: ${order.receiveWarehouseId}`}</div>
                                                </ListGroup.Item>
                                            </>
                                        )}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} className="mt-4">
                            <Card>
                                <Card.Header><h6 className="mb-0">Order Items</h6></Card.Header>
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
                                                    <td>
                                                        <div className="fw-medium">{product.name}</div>
                                                        <small className="text-muted">ID: {detail.productId}</small>
                                                    </td>
                                                    <td className="text-end">{formatCurrency(detail.price)}</td>
                                                    <td className="text-center fw-bold">{detail.quantity}</td>
                                                    <td className="text-end fw-bold">{formatCurrency(detail.price * detail.quantity)}</td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-muted">This order has no items.</td>
                                            </tr>
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
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
                <Button variant="primary" onClick={() => { onHide(); setTimeout(() => onEdit(order), 150); }}>
                    <i className="fas fa-edit me-2"></i>Edit Order
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default OrderViewModal;