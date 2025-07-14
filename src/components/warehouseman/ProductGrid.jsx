import { Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';

function ProductGrid({ 
    products, 
    getProductType, 
    getAvailableWarehouses, 
    handleSelectProduct, 
    isProductSelected 
}) {
    if (products.length === 0) {
        return (
            <Alert variant="info" className="text-center">
                <i className="fas fa-info-circle me-2"></i>
                No products available for import. All products are either already in your warehouse or not available in other warehouses.
            </Alert>
        );
    }

    return (
        <Row>
            {products.map(product => {
                const availableWarehouses = getAvailableWarehouses(product.id);
                
                return (
                    <Col key={product.id} lg={6} xl={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="card-title mb-1">{product.name}</h6>
                                    <Badge bg="secondary" className="ms-2">
                                        {getProductType(product.productTypeId)}
                                    </Badge>
                                </div>
                                
                                <p className="text-muted small mb-2">{product.description}</p>
                                
                                <div className="mb-3">
                                    <strong className="text-primary">
                                        {product.price.toLocaleString('vi-VN')} ₫
                                    </strong>
                                </div>

                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Available from:</small>
                                    {availableWarehouses.map(({ warehouse: wh, quantity }) => (
                                        <div key={wh.id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                            <div>
                                                <small className="fw-bold">{wh.name}</small>
                                                <br />
                                                <small className="text-muted">{wh.location}</small>
                                            </div>
                                            <div className="text-end">
                                                <Badge bg="success">{quantity} units</Badge>
                                                <br />
                                                <Button
                                                    size="sm"
                                                    variant={isProductSelected(product.id, wh.id) ? "success" : "outline-primary"}
                                                    className="mt-1"
                                                    onClick={() => handleSelectProduct(product, wh, quantity)}
                                                >
                                                    {isProductSelected(product.id, wh.id) ? (
                                                        <>
                                                            <i className="fas fa-check me-1"></i>
                                                            Selected
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-plus me-1"></i>
                                                            Select
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
}

export default ProductGrid;