import { useState, useMemo } from 'react';
import { Table, Form, InputGroup, Badge, Button, Row, Col, Card } from 'react-bootstrap';
import ProductEditModal from './products/ProductEditModal';

function WarehouseProducts({ warehouse, products, inventory, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterStatus, setFilterStatus] = useState('all');
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const productsWithInventory = useMemo(() => {
    return products.map(product => {
        const items = inventory.filter(item => item.productId === product.id);
        const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
        return {
            ...product,
            quantity: totalQuantity,
            inventoryId: items[0]?.id || null 
        };
    });
}, [products, inventory]);
    

    const filteredProducts = useMemo(() => {
        let filtered = productsWithInventory.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStatus !== 'all') {
            switch (filterStatus) {
                case 'in_stock': 
                    filtered = filtered.filter(product => product.quantity > 0);
                    break;
                case 'out_of_stock':
                    filtered = filtered.filter(product => product.quantity === 0);
                    break;
                default:
                    break;
            }
        }

        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy === 'price' || sortBy === 'quantity') {
                aValue = Number(aValue) || 0;
                bValue = Number(bValue) || 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [productsWithInventory, searchTerm, sortBy, sortOrder, filterStatus]);

    const getProductStatusBadge = (quantity) => {
        if (quantity > 0) {
            return <Badge bg="success">Available</Badge>;
        }
        return <Badge bg="danger">Out of Stock</Badge>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const isWarrantyExpired = (warrantyDate) => {
        if (!warrantyDate) return false;
        const date = new Date(warrantyDate);
        if (isNaN(date.getTime())) return false; 
        return date < new Date();
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setSelectedProduct(null);
    };

    const handleEditSuccess = () => {
        onRefresh();
    };    
    
    return (
        <div>
            <Row className="mb-4">
                <Col md={4}>
                    <InputGroup>
                        <InputGroup.Text>
                            <i className="fas fa-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="in_stock">Available</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="quantity">Sort by Quantity</option>
                        <option value="price">Sort by Price</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </Form.Select>
                </Col>
            </Row>

            <Card>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Product Status</th>
                                <th>Warranty</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div>
                                                <div className="fw-medium">{product.name}</div>
                                                <small className="text-muted">{product.description}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fw-medium">
                                                {formatCurrency(product.price)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="fw-bold">{product.quantity}</span>
                                        </td>
                                        <td>
                                            {getProductStatusBadge(product.quantity)}
                                        </td>
                                        <td>
                                            <div>
                                                <small>
                                                    {product.warrantyExpire ? 
                                                        new Date(product.warrantyExpire).toLocaleDateString('vi-VN') : 
                                                        'N/A'
                                                    }
                                                </small>
                                                {isWarrantyExpired(product.warrantyExpire) && (
                                                    <div>
                                                        <Badge bg="danger" className="mt-1">Expired</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => handleEditProduct(product)}
                                                title="Edit Product"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        <i className="fas fa-box-open fa-2x text-muted mb-2"></i>
                                        <div className="text-muted">No products found</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <ProductEditModal
                show={showEditModal}
                onHide={handleCloseModal}
                product={selectedProduct}
                warehouse={warehouse}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}

export default WarehouseProducts;