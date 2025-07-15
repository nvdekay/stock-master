import { Row, Col, Card, Badge, Button, Alert, Image } from 'react-bootstrap';

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
                    <Col key={product.id} lg={3} md={6} sm={6} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            {/* Product Image */}
                            <div style={{ height: '200px', overflow: 'hidden' }}>
                                <Image
                                    className='mt-4'
                                    src={product.src || '/assets/images/products/default.jpg'}
                                    alt={product.name}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                        e.target.src = '/assets/images/products/default.jpg';
                                    }}
                                />
                            </div>

                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="card-title mb-1 text-truncate" title={product.name}>
                                        {product.name}
                                    </h6>
                                    <Badge bg="secondary" className="ms-2 flex-shrink-0">
                                        {getProductType(product.productTypeId)}
                                    </Badge>
                                </div>
                                
                                <p className="text-muted small mb-2 flex-grow-1" 
                                   style={{ 
                                       overflow: 'hidden', 
                                       textOverflow: 'ellipsis', 
                                       display: '-webkit-box',
                                       WebkitLineClamp: 2,
                                       WebkitBoxOrient: 'vertical'
                                   }}>
                                    {product.description}
                                </p>
                                
                                <div className="mb-3">
                                    <strong className="text-primary">
                                        {product.price.toLocaleString('vi-VN')} ₫
                                    </strong>
                                </div>

                                <div className="mt-auto">
                                    <small className="text-muted d-block mb-1">Available from:</small>
                                    {availableWarehouses.map(({ warehouse: wh, quantity }) => (
                                        <div key={wh.id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                            <div className="flex-grow-1">
                                                <small className="fw-bold d-block text-truncate" title={wh.name}>
                                                    {wh.name}
                                                </small>
                                                <small className="text-muted text-truncate d-block" title={wh.location}>
                                                    {wh.location}
                                                </small>
                                            </div>
                                            <div className="text-end flex-shrink-0 ms-2">
                                                <Badge bg="success" className="d-block mb-1">
                                                    {quantity} units
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant={isProductSelected(product.id, wh.id) ? "success" : "outline-primary"}
                                                    onClick={() => handleSelectProduct(product, wh, quantity)}
                                                    className="w-100"
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