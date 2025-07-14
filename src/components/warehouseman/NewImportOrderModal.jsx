import { useState } from 'react';
import { Modal, Button, Form, Table, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';

function NewImportOrderModal({ show, onHide, selectedProducts, warehouse, onSuccess }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [note, setNote] = useState('');

    const totalAmount = selectedProducts.reduce((sum, product) => 
        sum + (product.price * product.requestedQuantity), 0
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Group products by source warehouse
            const ordersByWarehouse = selectedProducts.reduce((acc, product) => {
                const key = product.sourceWarehouseId;
                if (!acc[key]) {
                    acc[key] = {
                        sourceWarehouseId: key,
                        sourceWarehouseName: product.sourceWarehouseName,
                        products: []
                    };
                }
                acc[key].products.push(product);
                return acc;
            }, {});

            // Create separate import orders for each source warehouse
            for (const [sourceWarehouseId, orderData] of Object.entries(ordersByWarehouse)) {
                // Get max order ID
                const ordersRes = await api.get('/orders');
                const maxId = Math.max(...ordersRes.data.map(o => parseInt(o.id) || 0), 0);
                const newOrderId = (maxId + 1).toString();

                // Find a staff member from the source warehouse to be the sender
                const usersRes = await api.get('/users');
                const sourceStaff = usersRes.data.find(u => 
                    u.warehouseId === sourceWarehouseId && 
                    ['staff', 'exportstaff'].includes(u.role)
                );

                // Create the import order
                const orderPayload = {
                    id: newOrderId,
                    type: "transfer",
                    status: "pending",
                    date: new Date().toISOString().split('T')[0],
                    enterpriseId: user.enterpriseId,
                    senderStaffId: sourceStaff ? sourceStaff.id : null,
                    receiverStaffId: user.id,
                    sendWarehouseId: sourceWarehouseId,
                    receiveWarehouseId: warehouse.id,
                    buyerId: null,
                    note: note || `Import request from ${warehouse.name} to ${orderData.sourceWarehouseName}`
                };

                await api.post('/orders', orderPayload);

                // Create order details for each product
                const orderDetailsRes = await api.get('/orderDetails');
                let maxDetailId = Math.max(...orderDetailsRes.data.map(d => parseInt(d.id) || 0), 0);

                for (const product of orderData.products) {
                    const detailPayload = {
                        id: (++maxDetailId).toString(),
                        orderId: newOrderId,
                        productId: product.id,
                        quantity: product.requestedQuantity,
                        price: product.price
                    };

                    await api.post('/orderDetails', detailPayload);
                }
            }

            onSuccess();
        } catch (err) {
            console.error('Error creating import order:', err);
            setError('Failed to create import order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-download me-2"></i>
                    Create Import Order
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className="mb-3">
                        <Form.Label>Destination Warehouse</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={`${warehouse.name} - ${warehouse.location}`} 
                            readOnly 
                            className="bg-light"
                        />
                    </div>

                    <div className="mb-3">
                        <Form.Label>Note</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Enter any additional notes for this import order..."
                        />
                    </div>

                    <h6>Products to Import:</h6>
                    <Table responsive className="mb-3">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>From Warehouse</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedProducts.map((product) => (
                                <tr key={`${product.id}-${product.sourceWarehouseId}`}>
                                    <td>
                                        <div>
                                            <strong>{product.name}</strong>
                                            <br />
                                            <small className="text-muted">{product.description}</small>
                                        </div>
                                    </td>
                                    <td>{product.sourceWarehouseName}</td>
                                    <td>{product.requestedQuantity}</td>
                                    <td>{product.price.toLocaleString('vi-VN')} ₫</td>
                                    <td>{(product.price * product.requestedQuantity).toLocaleString('vi-VN')} ₫</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="table-primary">
                                <th colSpan="4">Total Amount:</th>
                                <th>{totalAmount.toLocaleString('vi-VN')} ₫</th>
                            </tr>
                        </tfoot>
                    </Table>

                    <Alert variant="info">
                        <i className="fas fa-info-circle me-2"></i>
                        This will create separate import orders for each source warehouse. 
                        The orders will be sent to the respective warehouses for approval.
                    </Alert>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check me-2"></i>
                                Create Import Order
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default NewImportOrderModal;