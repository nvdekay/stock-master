import { useMemo } from 'react';
import { Row, Col, Card, ListGroup, ProgressBar } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function WarehouseOverview({ warehouse, enterprise, manager, staff, shippers, products, inventory, exportOrders = [], importOrders = [], wholesaleOrders = [] }) {
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalProducts = products.length;
    const totalStaff = staff.length;
    const totalShippers = shippers.length;
    const totalEmployees = totalStaff + totalShippers;

    const lowStockItems = inventory.filter(item => item.quantity <= 10 && item.quantity > 0);
    const outOfStockItems = inventory.filter(item => item.quantity === 0);

    const statistics = useMemo(() => {
        const allUniqueOrders = Array.from(
            [...exportOrders, ...importOrders, ...wholesaleOrders]
                .reduce((map, order) => map.set(order.id, order), new Map())
                .values()
        );
        const totalValue = inventory.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (product?.price || 0) * item.quantity;
        }, 0);

        const productQuantityMap = products.map(product => {
            const totalQty = inventory
                .filter(i => i.productId === product.id)
                .reduce((sum, i) => sum + i.quantity, 0);
            return { productId: product.id, quantity: totalQty };
        });

        const inStockCount = productQuantityMap.filter(p => p.quantity > 10).length;
        const lowStockCount = productQuantityMap.filter(p => p.quantity > 0 && p.quantity <= 10).length;
        const outOfStockCount = productQuantityMap.filter(p => p.quantity === 0).length;

        const stockData = [
            { name: 'In Stock', value: inStockCount, color: '#28a745' },
            { name: 'Low Stock', value: lowStockCount, color: '#ffc107' },
            { name: 'Out of Stock', value: outOfStockCount, color: '#dc3545' }
        ].filter(item => item.value > 0);

        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().slice(0, 7);

            const imports = allUniqueOrders.filter(o => o.date?.startsWith(monthKey) && importOrders.some(io => io.id === o.id));
            const exports = allUniqueOrders.filter(o => o.date?.startsWith(monthKey) && exportOrders.some(eo => eo.id === o.id));
            const wholesale = allUniqueOrders.filter(o => o.date?.startsWith(monthKey) && wholesaleOrders.some(wo => wo.id === o.id));

            monthlyData.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                imports: imports.length,
                exports: exports.length,
                wholesale: wholesale.length
            });
        }

        const orderStats = {
            totalExports: exportOrders.length,
            totalImports: importOrders.length,
            totalWholesale: wholesaleOrders.length,
            wholesaleRevenue: allUniqueOrders
                .filter(o => o.type === 'wholesale')
                .reduce((sum, order) => sum + (order.totalPrice || 0), 0),

            pending: allUniqueOrders.filter(o => o.status === 'pending').length,
            processing: allUniqueOrders.filter(o => o.status === 'processing').length,
            in_transit: allUniqueOrders.filter(o => o.status === 'in_transit').length,
            shipped: allUniqueOrders.filter(o => o.status === 'shipped').length,
            completed: allUniqueOrders.filter(o => o.status === 'completed').length,
            cancelled: allUniqueOrders.filter(o => o.status === 'cancelled').length,

            pendingAndProcessing: allUniqueOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
            inTransitAndShipped: allUniqueOrders.filter(o => o.status === 'in_transit' || o.status === 'shipped').length,
        };

        const orderStatusData = [
            { name: 'Pending', value: allUniqueOrders.filter(o => o.status === 'pending').length, color: '#ffc107' },
            { name: 'Processing', value: allUniqueOrders.filter(o => o.status === 'processing').length, color: '#17a2b8' },
            { name: 'In Transit', value: allUniqueOrders.filter(o => o.status === 'in_transit').length, color: '#6f42c1' },
            { name: 'Shipped', value: allUniqueOrders.filter(o => o.status === 'shipped').length, color: '#007bff' },
            { name: 'Completed', value: allUniqueOrders.filter(o => o.status === 'completed').length, color: '#28a745' },
            { name: 'Cancelled', value: allUniqueOrders.filter(o => o.status === 'cancelled').length, color: '#dc3545' }
        ].filter(item => item.value > 0);

        return {
            totalValue,
            inStockCount,
            lowStockCount,
            outOfStockCount,
            stockData,
            monthlyData,
            orderStats,
            orderStatusData
        };
    }, [products, inventory, exportOrders, importOrders, wholesaleOrders]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };
    console.log('Warehouse statistics:', statistics);

    const COLORS = ['#28a745', '#ffc107', '#dc3545', '#17a2b8', '#007bff', '#6f42c1'];

    return (
        <div>
            <Row>
                <Col className="mb-4" md={8}>
                    <Card className="h-100">
                        <Card.Header>
                            <h5 className="text-center mb-0">
                                Warehouse Information
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col sm={6} className="mb-3">
                                    <strong>Warehouse Name:</strong>
                                    <div className="text-muted">{warehouse.name}</div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <strong>Location:</strong>
                                    <div className="text-muted">{warehouse.location}</div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <strong>Enterprise:</strong>
                                    <div className="text-muted">{enterprise?.name || 'N/A'}</div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <strong>Warehouse Manager:</strong>
                                    <div className="text-muted">
                                        {manager ? (
                                            <div>
                                                <div>{manager.fullName}</div>
                                                <small className="text-muted">{manager.email}</small>
                                            </div>
                                        ) : 'No manager assigned'}
                                    </div>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <strong>Staff Count:</strong>
                                    <div className="text-muted">
                                        {totalStaff} warehouse staff
                                        {totalShippers > 0 && (
                                            <div className="small text-info">
                                                + {totalShippers} enterprise shippers
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className="mb-4" md={4}>
                    <Card className="h-100">
                        <Card.Header>
                            <h5 className="text-center mb-0">
                                Quick Statistics
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <div className="text-muted small">Total Products</div>
                                    <div className="fs-4 fw-bold text-primary">{totalProducts}</div>
                                </div>
                                <i className="fas fa-boxes fa-2x text-primary opacity-50"></i>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <div className="text-muted small">Total Quantity</div>
                                    <div className="fs-4 fw-bold text-success">{totalQuantity.toLocaleString()}</div>
                                </div>
                                <i className="fas fa-cubes fa-2x text-success opacity-50"></i>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-muted small">Total Employees</div>
                                    <div className="fs-4 fw-bold text-warning">{totalEmployees}</div>
                                    <small className="text-muted">
                                        {totalStaff} staff + {totalShippers} shippers
                                    </small>
                                </div>
                                <i className="fas fa-users fa-2x text-warning opacity-50"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg className="mb-4">
                    <Card className="text-center border-primary h-100">
                        <Card.Body>
                            <i className="fas fa-dollar-sign fa-2x text-warning mb-2"></i>
                            <h5 className="mb-0 text-warning">{formatCurrency(statistics.totalValue)}</h5>
                            <p className="text-muted mb-0 small">Inventory Value</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg className="mb-4">
                    <Card className="text-center border-info h-100">
                        <Card.Body>
                            <i className="fas fa-handshake fa-2x text-info mb-2"></i>
                            <h5 className="mb-0 text-info">{formatCurrency(statistics.orderStats.wholesaleRevenue)}</h5>
                            <p className="text-muted mb-0 small">Wholesale Revenue</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg className="mb-4">
                    <Card className="text-center border-warning h-100">
                        <Card.Body>
                            <i className="fas fa-clock fa-2x text-warning mb-2"></i>
                            <h5 className="mb-0 text-warning">{statistics.orderStats.pendingAndProcessing}</h5>
                            <p className="text-muted mb-0 small">Pending Orders</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg className="mb-4">
                    <Card className="text-center border-primary h-100">
                        <Card.Body>
                            <i className="fas fa-truck fa-2x text-primary mb-2"></i>
                            <h5 className="mb-0 text-primary">{statistics.orderStats.inTransitAndShipped}</h5>
                            <p className="text-muted mb-0 small">In Transit / Shipped</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg className="mb-4">
                    <Card className="text-center border-success h-100">
                        <Card.Body>
                            <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                            <h5 className="mb-0 text-success">{statistics.orderStats.completed}</h5>
                            <p className="text-muted mb-0 small">Completed Orders</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col className="mb-4" md={6}>
                    <Card className='h-100'>
                        <Card.Header>
                            <h5 className="text-center mb-0">
                                Stock Status Distribution
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {statistics.stockData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={statistics.stockData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statistics.stockData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-chart-pie fa-3x text-muted mb-3"></i>
                                    <p className="text-muted">No stock data</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col className="mb-4" md={6}>
                    <Card className='h-100'>
                        <Card.Header>
                            <h5 className="text-center mb-0">
                                Order Status Distribution
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {statistics.orderStatusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={statistics.orderStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statistics.orderStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-chart-pie fa-3x text-muted mb-3"></i>
                                    <p className="text-muted">No order data</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col className="mb-4" md={8}>
                    <Card className='h-100'>
                        <Card.Header>
                            <h5 className="text-center mb-0">
                                Monthly Activity Overview
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={statistics.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="imports" fill="#28a745" name="Imports" />
                                    <Bar dataKey="exports" fill="#dc3545" name="Exports" />
                                    <Bar dataKey="wholesale" fill="#ffc107" name="Wholesale Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className="mb-4" md={4}>
                    <Card className="h-100">
                        <Card.Header>
                            <h5 className="mb-0">
                                <i className="fas fa-clipboard-list me-2 text-warning"></i>
                                Order Summary
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span><i className="fas fa-arrow-up text-primary me-2"></i>Export Orders</span>
                                    <span className="fw-bold text-primary">{statistics.orderStats.totalExports}</span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span><i className="fas fa-arrow-down text-success me-2"></i>Import Orders</span>
                                    <span className="fw-bold text-success">{statistics.orderStats.totalImports}</span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span><i className="fas fa-handshake text-warning me-2"></i>Wholesale Orders</span>
                                    <span className="fw-bold text-warning">{statistics.orderStats.totalWholesale}</span>
                                </div>
                            </div>
                            <hr />
                            <div className="mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span><i className="fas fa-clock text-warning me-2"></i>Pending</span>
                                    <span className="fw-bold text-warning">{statistics.orderStats.pending}</span>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span><i className="fas fa-cogs text-info me-2"></i>Processing</span>
                                    <span className="fw-bold text-info">{statistics.orderStats.processing}</span>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span><i className="fas fa-truck-loading text-primary me-2"></i>In Transit / Shipped</span>
                                    <span className="fw-bold text-primary">{statistics.orderStats.in_transit + statistics.orderStats.shipped}</span>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span><i className="fas fa-check-circle text-success me-2"></i>Completed</span>
                                    <span className="fw-bold text-success">{statistics.orderStats.completed}</span>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span><i className="fas fa-times-circle text-danger me-2"></i>Cancelled</span>
                                    <span className="fw-bold text-danger">{statistics.orderStats.cancelled}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col className="mb-4" md={6}>
                    <Card className='h-100'>
                        <Card.Header>
                            <h5 className="text-center mb-0">
                                <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
                                Low Stock Alert
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {lowStockItems.length > 0 ? (
                                <ListGroup variant="flush">
                                    {lowStockItems.slice(0, 5).map((item, index) => {
                                        const product = products.find(p => p.id === item.productId);
                                        return (
                                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
                                                <div>
                                                    <div className="fw-medium">{product?.name || 'Unknown Product'}</div>
                                                    <small className="text-muted">ID: {item.productId}</small>
                                                </div>
                                                <span className="badge bg-warning">{item.quantity} left</span>
                                            </ListGroup.Item>
                                        );
                                    })}
                                    {lowStockItems.length > 5 && (
                                        <ListGroup.Item className="text-center text-muted px-0">
                                            And {lowStockItems.length - 5} more items...
                                        </ListGroup.Item>
                                    )}
                                </ListGroup>
                            ) : (
                                <p className="text-muted mb-0">
                                    <i className="fas fa-check-circle text-success me-2"></i>
                                    No low stock items
                                </p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col className="mb-4" md={6}>
                    <Card className='h-100'>
                        <Card.Header>
                            <h5 className="text-center mb-0">
                                <i className="fas fa-times-circle me-2 text-danger"></i>
                                Out of Stock Alert
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {outOfStockItems.length > 0 ? (
                                <ListGroup variant="flush">
                                    {outOfStockItems.slice(0, 5).map((item, index) => {
                                        const product = products.find(p => p.id === item.productId);
                                        return (
                                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
                                                <div>
                                                    <div className="fw-medium">{product?.name || 'Unknown Product'}</div>
                                                    <small className="text-muted">ID: {item.productId}</small>
                                                </div>
                                                <span className="badge bg-danger">Out of Stock</span>
                                            </ListGroup.Item>
                                        );
                                    })}
                                    {outOfStockItems.length > 5 && (
                                        <ListGroup.Item className="text-center text-muted px-0">
                                            And {outOfStockItems.length - 5} more items...
                                        </ListGroup.Item>
                                    )}
                                </ListGroup>
                            ) : (
                                <p className="text-muted mb-0">
                                    <i className="fas fa-check-circle text-success me-2"></i>
                                    All products are in stock
                                </p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default WarehouseOverview;