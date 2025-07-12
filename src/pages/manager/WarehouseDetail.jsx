import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Nav, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';
import WarehouseOverview from '../../components/manager/warehouse/WarehouseOverview';
import WarehouseProducts from '../../components/manager/warehouse/WarehouseProducts';
import WarehouseStaff from '../../components/manager/warehouse/WarehouseStaff';
import WarehouseHistory from '../../components/manager/warehouse/WarehouseHistory';

function WarehouseDetail() {
    const { warehouseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const [warehouseData, setWarehouseData] = useState({
        enterprise: null,
        manager: null,
        staff: [],
        shippers: [],
        products: [],
        inventory: [],
        exportOrders: [],
        importOrders: [],
        wholesaleOrders: []
    });

    const fetchWarehouseData = useCallback(async () => {
        if (!warehouseId) return;

        setLoading(true);
        setError(null);

        try {
            const [
                warehouseRes,
                usersRes,
                inventoryRes,
                productsRes,
                ordersRes,
                shipmentsRes,
                allWarehousesRes,
                orderDetailsRes
            ] = await Promise.all([
                api.get(`/warehouses/${warehouseId}`),
                api.get('/users'),
                api.get(`/inventory?warehouseId=${warehouseId}`),
                api.get('/products'),
                api.get('/orders'),
                api.get('/shipments'),
                api.get('/warehouses'),
                api.get('/orderDetails')
            ]);

            const warehouseInfo = warehouseRes.data;

            if (user.role === 'manager' && warehouseInfo.enterpriseId !== user.enterpriseId) {
                throw new Error('You do not have permission to access this warehouse.');
            }

            setWarehouse(warehouseInfo);

            const allUsers = usersRes.data;
            const allProducts = productsRes.data;
            const allOrders = ordersRes.data;
            const allShipments = shipmentsRes.data;
            const allWarehouses = allWarehousesRes.data;
            const allOrderDetails = orderDetailsRes.data;

            const enterpriseRes = await api.get(`/enterprises/${warehouseInfo.enterpriseId}`);
            const enterprise = enterpriseRes.data;

            const warehouseStaff = allUsers.filter(u => u.warehouseId === warehouseId && u.role === 'staff');
            const enterpriseShippers = allUsers.filter(u => u.enterpriseId === warehouseInfo.enterpriseId && u.role === 'shipper');
            const manager = allUsers.find(u => u.enterpriseId === warehouseInfo.enterpriseId && u.role === 'manager');

            const inventory = inventoryRes.data;
            const productIds = [...new Set(inventory.map(item => item.productId))];
            const warehouseProducts = allProducts.filter(product => productIds.includes(product.id));

            const enrichOrder = (order) => {
                const senderStaff = allUsers.find(u => u.id === order.senderStaffId);
                const receiverStaff = allUsers.find(u => u.id === order.receiverStaffId);
                const buyer = allUsers.find(u => u.id === order.buyerId);

                const sendWarehouse = allWarehouses.find(w => w.id === order.sendWarehouseId);
                const receiveWarehouse = allWarehouses.find(w => w.id === order.receiveWarehouseId);

                const shipment = allShipments.find(s => s.orderId === order.id);
                const shipper = shipment ? allUsers.find(u => u.id === shipment.shipperId) : null;

                const details = allOrderDetails.filter(d => d.orderId === order.id);
                const totalPrice = details.reduce((sum, detail) => {
                    const product = allProducts.find(p => p.id === detail.productId);
                    const price = detail.price || product?.price || 0;
                    return sum + (price * detail.quantity);
                }, 0);

                return {
                    id: order.id,
                    type: order.type,
                    status: order.status,
                    date: order.date,
                    enterpriseId: order.enterpriseId,
                    senderStaffId: order.senderStaffId,
                    receiverStaffId: order.receiverStaffId,
                    sendWarehouseId: order.sendWarehouseId,
                    receiveWarehouseId: order.receiveWarehouseId,
                    buyerId: order.buyerId,
                    note: order.note,
                    senderStaff,
                    receiverStaff,
                    buyer,
                    sendWarehouse,
                    receiveWarehouse,
                    shipment,
                    shipper,
                    totalPrice
                };
            };

            const exportOrders = allOrders
                .filter(o => o.sendWarehouseId === warehouseId && o.type === 'transfer')
                .map(enrichOrder);

            const importOrders = allOrders
                .filter(o => o.receiveWarehouseId === warehouseId)
                .map(enrichOrder);

            const wholesaleOrders = allOrders
                .filter(o => o.type === 'wholesale' && o.sendWarehouseId === warehouseId)
                .map(enrichOrder);

            setWarehouseData({
                enterprise,
                manager,
                staff: warehouseStaff,
                shippers: enterpriseShippers,
                products: warehouseProducts,
                inventory,
                exportOrders: exportOrders,
                importOrders: importOrders,
                wholesaleOrders: wholesaleOrders
            });

        } catch (err) {
            console.error('Error fetching warehouse data:', err);
            setError(err.message || 'Failed to load warehouse data');
        } finally {
            setLoading(false);
        }
    }, [warehouseId, user]);

    useEffect(() => {
        fetchWarehouseData();
    }, [fetchWarehouseData]);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    <hr />
                    <Button variant="outline-danger" onClick={() => navigate('/manager/warehouse')}>
                        Back to Warehouses
                    </Button>
                </Alert>
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Alert variant="warning">Warehouse not found</Alert>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <WarehouseOverview {...warehouseData} warehouse={warehouse} />;
            case 'products':
                return <WarehouseProducts warehouse={warehouse} products={warehouseData.products} inventory={warehouseData.inventory} onRefresh={fetchWarehouseData} />;
            case 'staff':
                return <WarehouseStaff warehouse={warehouse} staff={warehouseData.staff} shippers={warehouseData.shippers} manager={warehouseData.manager} onRefresh={fetchWarehouseData} />;
            case 'history':
                return <WarehouseHistory warehouse={warehouse} exportOrders={warehouseData.exportOrders} importOrders={warehouseData.importOrders} wholesaleOrders={warehouseData.wholesaleOrders} staff={warehouseData.staff} shippers={warehouseData.shippers} onRefresh={fetchWarehouseData} />;
            default:
                return null;
        }
    };

    return (
        <>
            <header className="p-4 bg-white border-bottom">
                <Row className="align-items-center">
                    <Col>
                        <div className="d-flex align-items-center mb-2">
                            <Button
                                variant="link"
                                className="p-0 me-2 text-decoration-none"
                                onClick={() => navigate('/manager/warehouse')}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </Button>
                            <h4 className="mb-0">{warehouse.name}</h4>
                        </div>
                        <p className="text-muted mb-0">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {warehouse.location}
                        </p>
                    </Col>
                </Row>
            </header>

            <div className="p-4">
                <Card className="shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                            <Nav.Item>
                                <Nav.Link eventKey="overview">
                                    <i className="fas fa-tachometer-alt me-2"></i>Overview & Statistics
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="products">
                                    <i className="fas fa-boxes me-2"></i>Products ({warehouseData.products.length})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="staff">
                                    <i className="fas fa-users me-2"></i>Staff ({warehouseData.staff.length + warehouseData.shippers.length})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="history">
                                    <i className="fas fa-history me-2"></i>History
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body>
                        {renderTabContent()}
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default WarehouseDetail;