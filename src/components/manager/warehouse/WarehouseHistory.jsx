import { useState, useMemo, useEffect } from 'react';
import { Table, Card, Badge, Button, Row, Col, Form, InputGroup, Nav } from 'react-bootstrap';
import OrderViewModal from './orders/OrderViewModal';
import OrderEditModal from './orders/OrderEditModal';
import api from '../../../api/axiosInstance';

function WarehouseHistory({ warehouse, exportOrders, importOrders, wholesaleOrders, staff, shippers, onRefresh }) {

    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const allEmployees = [...staff, ...shippers];

    const allHistory = useMemo(() => {
        const exports = exportOrders
            .filter(order => order.type === 'transfer')
            .map(order => ({
                ...order,
                type: 'export',
                historyType: 'transfer',
                destination: order.receiveWarehouse ?
                    `${order.receiveWarehouse.name} (${order.receiveWarehouse.location})` :
                    'Unknown destination'
            }));

        const imports = importOrders.map(order => ({
            ...order,
            type: 'import',
            historyType: order.type, 
            source: order.sendWarehouse ?
                `${order.sendWarehouse.name} (${order.sendWarehouse.location})` :
                'Unknown source'
        }));

        const wholesale = wholesaleOrders.map(order => ({
            ...order,
            type: 'wholesale',
            historyType: 'wholesale',
            destination: order.buyer ? `Buyer: ${order.buyer.fullName}` : 'Unknown buyer'
        }));
        console.log('Exports:', exports);
        console.log('Imports:', imports);
        console.log('Wholesale:', wholesale);
        return [...exports, ...imports, ...wholesale];
    }, [exportOrders, importOrders, wholesaleOrders]);

    const filteredHistory = useMemo(() => {
        let filtered = allHistory;

        if (activeTab !== 'all') {
            filtered = filtered.filter(order => order.type === activeTab);
        }

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toString().includes(searchTerm) ||
                order.buyer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.shipper?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [allHistory, activeTab, searchTerm, sortBy, sortOrder]);

    const getStaffName = (staffId) => {
        const staffMember = users.find(u => u.id === staffId);
        return staffMember ? staffMember.fullName : 'Unknown Staff';
    };

    const getTypeBadge = (type) => {
        const typeConfig = {
            import: { bg: 'success', text: 'Import', icon: 'fa-arrow-down' },
            export: { bg: 'primary', text: 'Export', icon: 'fa-arrow-up' },
            wholesale: { bg: 'warning', text: 'Wholesale', icon: 'fa-handshake' }
        };

        const config = typeConfig[type] || { bg: 'secondary', text: type, icon: 'fa-question' };
        return (
            <Badge bg={config.bg}>
                <i className={`fas ${config.icon} me-1`}></i>
                {config.text}
            </Badge>
        );
    };

    const getHistoryTypeBadge = (historyType) => {
        const typeConfig = {
            transfer: { bg: 'info', text: 'Transfer' },
            wholesale: { bg: 'warning', text: 'Wholesale' }
        };

        const config = typeConfig[historyType] || { bg: 'secondary', text: historyType };
        return <Badge bg={config.bg} className="ms-1">{config.text}</Badge>;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'warning', text: 'Pending' },
            processing: { bg: 'info', text: 'Processing' },
            in_transit: { bg: 'primary', text: 'In Transit' },
            shipped: { bg: 'primary', text: 'Shipped' },
            completed: { bg: 'success', text: 'Completed' },
            cancelled: { bg: 'danger', text: 'Cancelled' }
        };

        const config = statusConfig[status] || { bg: 'secondary', text: status };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowViewModal(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setShowEditModal(true);
    };

    const handleCloseModals = () => {
        setShowViewModal(false);
        setShowEditModal(false);
        setSelectedOrder(null);
    };

    const handleEditSuccess = () => {
        if (onRefresh) {
            onRefresh();
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await api.get('/users');
            setUsers(res.data);
        };
        fetchUsers();
    }, []);

    console.log('Filtered History:', filteredHistory);
    console.log(exportOrders, importOrders, wholesaleOrders);

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
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="date">Sort by Date</option>
                        <option value="id">Sort by ID</option>
                        <option value="type">Sort by Type</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </Form.Select>
                </Col>
            </Row>

            <Card>
                <Card.Header>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                        <Nav.Item>
                            <Nav.Link eventKey="all">
                                All History ({allHistory.length})
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="import">
                                Imports ({importOrders.length})
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="export">
                                Exports ({exportOrders.length})
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="wholesale">
                                Wholesale ({wholesaleOrders.length})
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Staff/Buyer</th>
                                <th>Source/Destination</th>
                                <th>Status/Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((order) => (
                                    <tr key={`${order.type}-${order.id}`}>
                                        <td>
                                            <span className="fw-medium">{order.id}</span>
                                        </td>
                                        <td>
                                            <div>
                                                {getTypeBadge(order.type)}
                                                {order.historyType && getHistoryTypeBadge(order.historyType)}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-medium">
                                                    {new Date(order.date).toLocaleDateString('vi-VN')}
                                                </div>
                                                <small className="text-muted">
                                                    {new Date(order.date).toLocaleDateString('vi-VN', {
                                                        weekday: 'short'
                                                    })}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                {order.type === 'wholesale' ? (
                                                    <div>
                                                        <div className="fw-medium">{order.buyer?.fullName || 'Unknown Buyer'}</div>
                                                        <small className="text-muted">{order.buyer?.email}</small>
                                                        {order.shipper && (
                                                            <div className="mt-1">
                                                                <small className="text-info">
                                                                    <i className="fas fa-truck me-1"></i>
                                                                    {order.shipper.fullName}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : order.type === 'export' ? (
                                                    <div>
                                                        <div className="fw-medium">{getStaffName(order.senderStaffId)}</div>
                                                        <small className="text-muted">Sender Staff</small>
                                                        {order.receiverStaffId && (
                                                            <div className="mt-1">
                                                                <small className="text-muted">
                                                                    To: {getStaffName(order.receiverStaffId)}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="fw-medium">{getStaffName(order.receiverStaffId || order.senderStaffId)}</div>
                                                        <small className="text-muted">Receiver Staff</small>
                                                        {order.senderStaffId && (
                                                            <div className="mt-1">
                                                                <small className="text-muted">
                                                                    From: {getStaffName(order.senderStaffId)}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="text-muted small">
                                                    {order.type === 'import' ? 'From:' : 'To:'}
                                                </div>
                                                <div className="small">
                                                    {order.type === 'import' ? order.source : order.destination}
                                                </div>
                                                {order.note && (
                                                    <div className="small text-muted mt-1">
                                                        <i className="fas fa-sticky-note me-1"></i>
                                                        {order.note}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                {getStatusBadge(order.status)}
                                                {typeof order.totalPrice === 'number' && order.totalPrice > 0 && (
                                                    <div className="small fw-bold text-success mt-1">
                                                        {formatCurrency(order.totalPrice)}
                                                    </div>
                                                )}
                                                {order.shipment?.deliveryDate && (
                                                    <div className="small text-muted mt-1">
                                                        Delivered: {new Date(order.shipment.deliveryDate).toLocaleDateString('vi-VN')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                className="me-1"
                                                onClick={() => handleViewOrder(order)}
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleEditOrder(order)}
                                                title="Edit Order"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        <i className="fas fa-history fa-2x text-muted mb-2"></i>
                                        <div className="text-muted">No history found</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Order View Modal */}
            <OrderViewModal
                show={showViewModal}
                onHide={handleCloseModals}
                order={selectedOrder}
                warehouse={warehouse}
                onEdit={handleEditOrder}
            />

            {/* Order Edit Modal */}
            <OrderEditModal
                show={showEditModal}
                onHide={handleCloseModals}
                order={selectedOrder}
                warehouse={warehouse}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}

export default WarehouseHistory;