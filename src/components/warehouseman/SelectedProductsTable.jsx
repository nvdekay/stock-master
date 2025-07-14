import { Card, Table, Form, Button } from 'react-bootstrap';

function SelectedProductsTable({ selectedProducts, updateQuantity, removeProduct }) {
    const totalAmount = selectedProducts.reduce((sum, product) => 
        sum + (product.price * product.requestedQuantity), 0
    );

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                    <i className="fas fa-shopping-cart me-2"></i>
                    Selected Products for Import ({selectedProducts.length})
                </h5>
            </Card.Header>
            <Card.Body>
                <Table responsive>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>From Warehouse</th>
                            <th>Price</th>
                            <th>Available</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Action</th>
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
                                <td>{product.price.toLocaleString('vi-VN')} ₫</td>
                                <td>
                                    <span className="badge bg-success">{product.maxQuantity}</span>
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        max={product.maxQuantity}
                                        value={product.requestedQuantity}
                                        onChange={(e) => updateQuantity(
                                            product.id, 
                                            product.sourceWarehouseId, 
                                            parseInt(e.target.value)
                                        )}
                                        style={{ width: '80px' }}
                                        size="sm"
                                    />
                                </td>
                                <td>
                                    <strong>{(product.price * product.requestedQuantity).toLocaleString('vi-VN')} ₫</strong>
                                </td>
                                <td>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => removeProduct(product.id, product.sourceWarehouseId)}
                                        title="Remove from selection"
                                    >
                                        <i className="fas fa-times"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="table-primary">
                            <th colSpan="5">Total Amount:</th>
                            <th>{totalAmount.toLocaleString('vi-VN')} ₫</th>
                            <th></th>
                        </tr>
                    </tfoot>
                </Table>
            </Card.Body>
        </Card>
    );
}

export default SelectedProductsTable;