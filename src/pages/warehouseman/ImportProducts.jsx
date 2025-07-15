import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, InputGroup, Button, Card, Badge, Spinner, Alert, Container } from 'react-bootstrap';
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

            // Get products that exist in current warehouse
            const currentWarehouseProductIds = allProducts
                .filter(product => product.warehouseId === user.warehouseId)
                .map(product => product.id);
            
            // Filter products that exist in other warehouses but not in current warehouse
            const availableProducts = allProducts.filter(product => {
                const isInCurrentWarehouse = currentWarehouseProductIds.includes(product.id);
                const isInOtherWarehouse = product.warehouseId && 
                                         product.warehouseId !== user.warehouseId && 
                                         product.quantity > 0;
                
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        // Find all products with the same productId in different warehouses
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

            <Row className="mb-4">
                <Col md={8}>
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
                <Col md={4} className="text-end">
                    {selectedProducts.length > 0 && (
                        <Button 
                            variant="primary" 
                            onClick={() => setShowModal(true)}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Create Import Order ({selectedProducts.length})
                        </Button>
                    )}
                </Col>
            </Row>

            {selectedProducts.length > 0 && (
                <SelectedProductsTable 
                    selectedProducts={selectedProducts}
                    updateQuantity={updateQuantity}
                    removeProduct={removeProduct}
                />
            )}

            <ProductGrid 
                products={filteredProducts}
                productTypes={productTypes}
                getProductType={getProductType}
                getAvailableWarehouses={getAvailableWarehouses}
                handleSelectProduct={handleSelectProduct}
                isProductSelected={isProductSelected}
            />

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