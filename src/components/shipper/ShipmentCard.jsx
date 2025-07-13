import React from 'react';
import { Card, Button, Table, Alert } from 'react-bootstrap';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const ShipmentCard = ({ shipment, handleStatusUpdate }) => {
    console.log('Rendering ShipmentCard with shipment:', shipment);
    return (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title>Shipment #{shipment.id} (Order #{shipment.orderId})</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    Status: {shipment.status} {shipment.deliveryDate && `(Delivered on ${shipment.deliveryDate})`}
                </Card.Subtitle>
                <Card.Text>
                    <strong>Order Date:</strong> {shipment.order?.date}<br />
                    <strong>From Warehouse:</strong> {shipment.warehouse.name} ({shipment.warehouse.location})<br />
                    <strong>Buyer:</strong> {shipment.buyer ? `${shipment.buyer.fullName} (${shipment.buyer.email})` : 'N/A'}<br />
                    <strong>Number of Items:</strong> {shipment.products.length} types - {
                        shipment.products.reduce((sum, p) => sum + p.quantity, 0)
                    } units<br />
                    <strong>Total Price:</strong> {shipment.products.reduce((acc, item) => acc + (item.quantity * item.price), 0).toLocaleString()} VND

                    <hr />

                    <strong>Products:</strong>
                    <Table striped bordered hover size="sm" className="mt-2">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipment.products.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.product?.name || 'Unknown'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price?.toLocaleString() || 0} VND</td>
                                    <td>{(item.quantity * item.price).toLocaleString()} VND</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <strong>Note:</strong> {shipment.note || 'No note'}
                </Card.Text>


                {shipment.status === 'assigned' && (
                    <Button variant="primary" onClick={() => handleStatusUpdate(shipment.id, 'in_transit')}>
                        <FaArrowRight className="me-2" /> Start Delivery
                    </Button>
                )}
                {shipment.status === 'in_transit' && (
                    <Button variant="success" onClick={() => handleStatusUpdate(shipment.id, 'delivered')} className="ms-2">
                        <FaCheckCircle className="me-2" /> Mark as Delivered
                    </Button>
                )}
                {(shipment.status === 'delivered' || shipment.status === 'completed') && (
                    <Alert variant="success" className="d-flex align-items-center mt-3">
                        <FaCheckCircle className="me-2" /> This shipment has been shipped successfully.
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default ShipmentCard;