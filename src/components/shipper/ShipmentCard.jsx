import React from 'react';
import { Card, Button, Table, Alert } from 'react-bootstrap';

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
                    <strong>From Warehouse:</strong> {shipment.warehouse.name} ({shipment.warehouse.location})<br />
                    <strong>Buyer:</strong> {shipment.buyer ? `${shipment.buyer.fullName} (${shipment.buyer.email})` : 'N/A'}<br />
                    <strong>Total Price:</strong> {(shipment.order?.totalPrice ?? 0).toLocaleString()} VND<br />
                    <strong>Products:</strong>
                    <Table striped bordered hover size="sm" className="mt-2">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipment.products.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.product?.name || 'Unknown'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price?.toLocaleString?.() || 0} VND</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <strong>Note:</strong> {shipment.note || 'No note'}
                </Card.Text>

                {shipment.status === 'assigned' && (
                    <Button variant="primary" onClick={() => handleStatusUpdate(shipment.id, 'in_transit')}>
                        Start Delivery
                    </Button>
                )}
                {shipment.status === 'in_transit' && (
                    <Button variant="success" onClick={() => handleStatusUpdate(shipment.id, 'delivered')} className="ms-2">
                        Mark as Delivered
                    </Button>
                )}
                {(shipment.status === 'delivered' || shipment.status === 'completed') && (
                    <Alert variant="info">No actions available for this shipment.</Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default ShipmentCard;