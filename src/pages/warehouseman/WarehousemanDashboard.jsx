import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Nav, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';
import WarehouseOverview from '../../components/manager/warehouse/WarehouseOverview';
import WarehouseProducts from '../../components/manager/warehouse/WarehouseProducts';
import WarehouseStaff from '../../components/manager/warehouse/WarehouseStaff';
import WarehouseHistory from '../../components/manager/warehouse/WarehouseHistory';

function WarehousemanDashboard() {
    const { user } = useAuth();
    console.log(user);
    
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
        exportOrders: [],
        importOrders: [],
        wholesaleOrders: []
    });

    const fetchWarehouseData = useCallback(async () => {
        if (!user.warehouseId) {
            setError('No warehouse assigned to this user');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [
                warehouseRes,
                usersRes,
                productsRes,
                ordersRes,
                shipmentsRes,
                allWarehousesRes,
                orderDetailsRes
            ] = await Promise.all([
                api.get(`/warehouses/${user.warehouseId}`),
                api.get('/users'),
                api.get('/products'),
                api.get('/orders'),
                api.get('/shipments'),
                api.get('/warehouses'),
                api.get('/orderDetails')
            ]);

            const warehouseInfo = warehouseRes.data;
            setWarehouse(warehouseInfo);

            const allUsers = usersRes.data;
            const allProducts = productsRes.data;
            const allOrders = ordersRes.data;
            const allShipments = shipmentsRes.data;
            const allWarehouses = allWarehousesRes.data;
            const allOrderDetails = orderDetailsRes.data;

            const enterpriseRes = await api.get(`/enterprises/${warehouseInfo.enterpriseId}`);
            const enterprise = enterpriseRes.data;
            console.log(allUsers,allProducts,allOrders,allShipments,allWarehouses,allOrderDetails);
            
            // Filter warehouse staff with new roles
            const warehouseStaff = allUsers.filter(u => 
                u.warehouseId === user.warehouseId && 
                ['staff', 'importstaff', 'exportstaff', 'warehouseman'].includes(u.role)
            );
            
            // Get enterprise shippers and manager
            const enterpriseShippers = allUsers.filter(u => 
                u.enterpriseId === warehouseInfo.enterpriseId && u.role === 'shipper'
            );
            const manager = allUsers.find(u => 
                u.enterpriseId === warehouseInfo.enterpriseId && u.role === 'manager'
            );

            // Filter products that belong to this warehouse (using warehouseId in products)
            const warehouseProducts = allProducts.filter(product => 
                product.warehouseId === user.warehouseId
            );

            const enrichOrder = (order) => {
                const senderStaff = allUsers.find(u => u.id === order.senderStaffId);
                const receiverStaff = allUsers.find(u => u.id === order.receiverStaffId);
                const buyer = allUsers.find(u => u.id === order.buyerId);
                const sendWarehouse = allWarehouses.find(w => w.id === order.sendWarehouseId);
                const receiveWarehouse = allWarehouses.find(w => w.id === order.receiveWarehouseId);
                const shipment = allShipments.find(s => s.orderId === order.id);
                const shipper = shipment ? allUsers.find(u => u.id === shipment.shipperId) : null;
                const enterpriseId = sendWarehouse?.enterpriseId || null;
    
                // Calculate total price from order details
                const details = allOrderDetails.filter(d => d.orderId === order.id);
                const totalPrice = details.reduce((sum, detail) => {
                    const product = allProducts.find(p => p.id === detail.productId);
                    const price = detail.price || product?.price || 0;
                    return sum + (price * detail.quantity);
                }, 0);

                return {
                    ...order,
                    senderStaff,
                    receiverStaff,
                    buyer,
                    sendWarehouse,
                    receiveWarehouse,
                    shipment,
                    shipper,
                    totalPrice,
                    details
                };
            };

            const exportOrders = allOrders
                .filter(o => o.sendWarehouseId === user.warehouseId && o.type === 'transfer')
                .map(enrichOrder);

            const importOrders = allOrders
                .filter(o => o.receiveWarehouseId === user.warehouseId)
                .map(enrichOrder);

            const wholesaleOrders = allOrders
                .filter(o => o.type === 'wholesale' && o.sendWarehouseId === user.warehouseId)
                .map(enrichOrder);

            setWarehouseData({
                enterprise,
                manager,
                staff: warehouseStaff,
                shippers: enterpriseShippers,
                products: warehouseProducts,
                exportOrders,
                importOrders,
                wholesaleOrders
            });

        } catch (err) {
            console.error('Error fetching warehouse data:', err);
            setError(err.message || 'Failed to load warehouse data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWarehouseData();
    }, [fetchWarehouseData]);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading warehouse data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="m-4">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    if (!warehouse) {
        return (
            <Alert variant="warning" className="m-4">
                No warehouse found for this user
            </Alert>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <WarehouseOverview {...warehouseData} warehouse={warehouse} />;
            case 'products':
                return <WarehouseProducts 
                    warehouse={warehouse} 
                    products={warehouseData.products} 
                    onRefresh={fetchWarehouseData} 
                />;
            case 'staff':
                return <WarehouseStaff 
                    warehouse={warehouse} 
                    staff={warehouseData.staff} 
                    shippers={warehouseData.shippers} 
                    manager={warehouseData.manager} 
                    onRefresh={fetchWarehouseData} 
                />;
            case 'history':
                return <WarehouseHistory 
                    warehouse={warehouse} 
                    exportOrders={warehouseData.exportOrders} 
                    importOrders={warehouseData.importOrders} 
                    wholesaleOrders={warehouseData.wholesaleOrders} 
                    staff={warehouseData.staff} 
                    shippers={warehouseData.shippers} 
                    onRefresh={fetchWarehouseData} 
                />;
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
                            <h4 className="mb-0">{warehouse.name}</h4>
                            <span className="badge bg-success ms-2">Warehouseman Dashboard</span>
                        </div>
                        <p className="text-muted mb-0">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {warehouse.location}
                        </p>
                        {warehouseData.enterprise && (
                            <p className="text-muted mb-0">
                                <i className="fas fa-building me-1"></i>
                                {warehouseData.enterprise.name}
                            </p>
                        )}
                    </Col>
                </Row>
            </header>

            <div className="p-4">
                <Card className="shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                            <Nav.Item>
                                <Nav.Link eventKey="overview">
                                    <i className="fas fa-tachometer-alt me-2"></i>Overview
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="products">
                                    <i className="fas fa-boxes me-2"></i>Products ({warehouseData.products.length})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="staff">
                                    <i className="fas fa-users me-2"></i>Staff ({warehouseData.staff.length})
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

export default WarehousemanDashboard;