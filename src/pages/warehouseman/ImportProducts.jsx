import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, InputGroup, Button, Card, Badge, Spinner, Alert, Container, Pagination } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';
import NewImportOrderModal from '../../components/warehouseman/NewImportOrderModal';
import ProductGrid from '../../components/warehouseman/ProductGrid';
import SelectedProductsTable from '../../components/warehouseman/SelectedProductsTable';

function ImportProducts() {
    const { user } = useAuth();
    const [warehouse, setWarehouse] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [productTypes, setProductTypes] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedProductType, setSelectedProductType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('name'); 
    const [sortOrder, setSortOrder] = useState('asc');

    const PRODUCTS_PER_PAGE = 20;

    const fetchData = useCallback(async () => {
        if (!user.warehouseId) {
            setError('No warehouse assigned to this user');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [warehouseRes, productsRes, typesRes, warehousesRes] = await Promise.all([
                api.get(`/warehouses/${user.warehouseId}`),
                api.get('/products'),
                api.get('/product_types'),
                api.get('/warehouses')
            ]);

            const warehouseInfo = warehouseRes.data;
            setWarehouse(warehouseInfo);

            const allProducts = productsRes.data;

            const currentWarehouseProductIds = allProducts
                .filter(product => product.warehouseId === user.warehouseId)
                .map(product => product.id);
            
            const availableProducts = allProducts.filter(product => {
                const isInCurrentWarehouse = currentWarehouseProductIds.includes(product.id);
                const isInOtherWarehouse = product.warehouseId && 
                                         product.warehouseId !== user.warehouseId && 
                                         product.quantity > 0;
            console.log(`Product ${product.name} - In Current: ${isInCurrentWarehouse}, In Other: ${isInOtherWarehouse}, Status: ${product.status}`);
                
            return !isInCurrentWarehouse && isInOtherWarehouse && product.status === 'available';
            });

            setProducts(availableProducts);
            setProductTypes(typesRes.data);
            setWarehouses(warehousesRes.data);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [user.warehouseId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedWarehouse, selectedProductType, sortBy, sortOrder]);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesWarehouse = !selectedWarehouse || product.warehouseId === selectedWarehouse;
        
        const matchesType = !selectedProductType || product.productTypeId?.toString() === selectedProductType;
        
        return matchesSearch && matchesWarehouse && matchesType;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'price':
                comparison = a.price - b.price;
                break;
            default:
                comparison = 0;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    const handleSelectProduct = (product, sourceWarehouse, maxQuantity) => {
        const existingIndex = selectedProducts.findIndex(
            p => p.id === product.id && p.sourceWarehouseId === sourceWarehouse.id
        );

        if (existingIndex >= 0) {
            setSelectedProducts(prev => prev.filter((_, index) => index !== existingIndex));
        } else {
            setSelectedProducts(prev => [...prev, {
                ...product,
                sourceWarehouseId: sourceWarehouse.id,
                sourceWarehouseName: sourceWarehouse.name,
                maxQuantity,
                requestedQuantity: 1
            }]);
        }
    };

    const updateQuantity = (productId, sourceWarehouseId, quantity) => {
        setSelectedProducts(prev => prev.map(p => 
            p.id === productId && p.sourceWarehouseId === sourceWarehouseId 
                ? { ...p, requestedQuantity: Math.max(1, Math.min(quantity, p.maxQuantity)) }
                : p
        ));
    };

    const removeProduct = (productId, sourceWarehouseId) => {
        setSelectedProducts(prev => prev.filter(
            p => !(p.id === productId && p.sourceWarehouseId === sourceWarehouseId)
        ));
    };

    const isProductSelected = (productId, sourceWarehouseId) => {
        return selectedProducts.some(p => p.id === productId && p.sourceWarehouseId === sourceWarehouseId);
    };

    const getAvailableWarehouses = (productId) => {
        const sameProducts = products.filter(product => 
            product.id === productId && 
            product.warehouseId !== user.warehouseId &&
            product.quantity > 0
        );
        
        return sameProducts.map(product => {
            const wh = warehouses.find(w => w.id === product.warehouseId);
            return {
                warehouse: wh,
                quantity: product.quantity
            };
        });
    };

    const getProductType = (typeId) => {
        const type = productTypes.find(t => t.id === parseInt(typeId));
        return type ? type.name : 'Unknown';
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedWarehouse('');
        setSelectedProductType('');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading available products...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <header className="mb-4">
                <h3 className="mb-1">Import Products</h3>
                <p className="text-muted">Request products from other warehouses</p>
            </header>

            {/* Filters and Search */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row className="g-3">
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
                        
                        <Col md={2}>
                            <Form.Select
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                            >
                                <option value="">All Warehouses</option>
                                {warehouses
                                    .filter(wh => wh.id !== user.warehouseId)
                                    .map(wh => (
                                        <option key={wh.id} value={wh.id}>
                                            {wh.name}
                                        </option>
                                    ))
                                }
                            </Form.Select>
                        </Col>

                        <Col md={2}>
                            <Form.Select
                                value={selectedProductType}
                                onChange={(e) => setSelectedProductType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                {productTypes.map(type => (
                                    <option key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col md={2}>
                            <Form.Select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="price-asc">Price (Low-High)</option>
                                <option value="price-desc">Price (High-Low)</option>
                            </Form.Select>
                        </Col>

                        <Col md={2}>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={clearFilters}
                                    className="flex-grow-1"
                                >
                                    <i className="fas fa-times me-1"></i>
                                    Clear
                                </Button>
                                {selectedProducts.length > 0 && (
                                    <Button 
                                        variant="primary" 
                                        onClick={() => setShowModal(true)}
                                        className="flex-grow-1"
                                    >
                                        <i className="fas fa-plus me-1"></i>
                                        Create ({selectedProducts.length})
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Results Info */}
                    <Row className="mt-3">
                        <Col>
                            <small className="text-muted">
                                Showing {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, sortedProducts.length)} of {sortedProducts.length} products
                                {selectedProducts.length > 0 && ` | ${selectedProducts.length} selected`}
                            </small>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {selectedProducts.length > 0 && (
                <SelectedProductsTable 
                    selectedProducts={selectedProducts}
                    updateQuantity={updateQuantity}
                    removeProduct={removeProduct}
                />
            )}

            <ProductGrid 
                products={paginatedProducts}
                productTypes={productTypes}
                getProductType={getProductType}
                getAvailableWarehouses={getAvailableWarehouses}
                handleSelectProduct={handleSelectProduct}
                isProductSelected={isProductSelected}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                        <Pagination.First 
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        />
                        <Pagination.Prev 
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        
                        {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1;
                            const isNearCurrent = Math.abs(page - currentPage) <= 2;
                            const isFirstOrLast = page === 1 || page === totalPages;
                            
                            if (isNearCurrent || isFirstOrLast) {
                                return (
                                    <Pagination.Item
                                        key={page}
                                        active={page === currentPage}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Pagination.Item>
                                );
                            } else if (page === currentPage - 3 || page === currentPage + 3) {
                                return <Pagination.Ellipsis key={page} />;
                            }
                            return null;
                        })}

                        <Pagination.Next 
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                        <Pagination.Last 
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                </div>
            )}

            {warehouse && (
                <NewImportOrderModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    selectedProducts={selectedProducts}
                    warehouse={warehouse}
                    onSuccess={() => {
                        setShowModal(false);
                        setSelectedProducts([]);
                        fetchData();
                    }}
                />
            )}
        </Container>
    );
}

export default ImportProducts;