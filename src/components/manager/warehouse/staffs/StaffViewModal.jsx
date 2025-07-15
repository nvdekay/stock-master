import { Modal, Row, Col, Card, Button, Badge } from 'react-bootstrap';

function StaffViewModal({ show, onHide, staff, warehouse, onEdit }) {
    if (!staff) return null;

    const getRoleBadge = (role) => {
        const roleConfig = {
            manager: { bg: 'primary', text: 'Manager' },
            staff: { bg: 'info', text: 'Warehouse Staff' },
            importstaff: { bg: 'warning', text: 'Import Staff' },
            exportstaff: { bg: 'secondary', text: 'Export Staff' },
            warehouseman: { bg: 'dark', text: 'Warehouse Manager' },
            shipper: { bg: 'success', text: 'Shipper' }
        };
        
        const config = roleConfig[role] || { bg: 'secondary', text: role };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const getWorkLocation = () => {
        if (['staff', 'importstaff', 'exportstaff', 'warehouseman'].includes(staff.role) && staff.warehouseId) {
            return warehouse.name;
        } else if (staff.role === 'shipper' || staff.role === 'manager') {
            return 'Enterprise-wide';
        }
        return 'Not assigned';
    };

    const getResponsibilities = (role) => {
        switch(role) {
            case 'manager':
                return [
                    'Oversee all warehouse operations',
                    'Manage enterprise staff',
                    'Monitor business performance',
                    'Coordinate between warehouses'
                ];
            case 'staff':
                return [
                    'Manage warehouse inventory',
                    'Process internal transfers',
                    'Handle general warehouse tasks',
                    'Assist in stock management'
                ];
            case 'importstaff':
                return [
                    'Process incoming shipments',
                    'Handle import documentation',
                    'Verify incoming inventory',
                    'Coordinate with suppliers'
                ];
            case 'exportstaff':
                return [
                    'Process outgoing shipments',
                    'Handle export documentation',
                    'Prepare orders for delivery',
                    'Coordinate with customers'
                ];
            case 'warehouseman':
                return [
                    'Supervise warehouse operations',
                    'Manage warehouse staff',
                    'Oversee inventory management',
                    'Ensure warehouse efficiency'
                ];
            case 'shipper':
                return [
                    'Deliver wholesale orders',
                    'Handle shipments',
                    'Coordinate deliveries',
                    'Manage transportation logistics'
                ];
            default:
                return ['General responsibilities'];
        }
    };

    const getIconForRole = (role) => {
        const icons = {
            manager: 'crown',
            staff: 'user',
            importstaff: 'truck-loading',
            exportstaff: 'shipping-fast',
            warehouseman: 'warehouse',
            shipper: 'truck'
        };
        return icons[role] || 'user';
    };

    const getColorForRole = (role) => {
        const colors = {
            manager: 'primary',
            staff: 'info',
            importstaff: 'warning',
            exportstaff: 'secondary',
            warehouseman: 'dark',
            shipper: 'success'
        };
        return colors[role] || 'info';
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-user me-2"></i>
                    Staff Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={6}>
                        <Card className="h-100">
                            <Card.Header>
                                <h6 className="mb-0">Personal Information</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="text-center mb-3">
                                    <div className={`bg-${getColorForRole(staff.role)} rounded-circle d-flex align-items-center justify-content-center mx-auto`} 
                                         style={{ width: '80px', height: '80px' }}>
                                        <i className={`fas fa-${getIconForRole(staff.role)} text-white fa-2x`}></i>
                                    </div>
                                    <h5 className="mt-2 mb-1">{staff.fullName}</h5>
                                    {getRoleBadge(staff.role)}
                                </div>
                                
                                <div className="mb-3">
                                    <strong>Staff ID:</strong>
                                    <div className="text-muted">{staff.id}</div>
                                </div>
                                <div className="mb-3">
                                    <strong>Username:</strong>
                                    <div className="text-muted">{staff.username}</div>
                                </div>
                                <div className="mb-3">
                                    <strong>Email:</strong>
                                    <div className="text-muted">{staff.email}</div>
                                </div>
                                <div className="mb-3">
                                    <strong>Role:</strong>
                                    <div className="mt-1">{getRoleBadge(staff.role)}</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="h-100">
                            <Card.Header>
                                <h6 className="mb-0">Work Information</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <strong>Enterprise ID:</strong>
                                    <div className="text-muted">{staff.enterpriseId || 'Not assigned'}</div>
                                </div>
                                <div className="mb-3">
                                    <strong>Work Location:</strong>
                                    <div className="text-muted">{getWorkLocation()}</div>
                                </div>
                                <div className="mb-3">
                                    <strong>Warehouse ID:</strong>
                                    <div className="text-muted">{staff.warehouseId || 'N/A (Enterprise-wide)'}</div>
                                </div>
                                <div className="mb-3">
                                    <strong>Account Status:</strong>
                                    <div className="mt-1">
                                        <Badge bg="success">Active</Badge>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => {
                    onHide();
                    setTimeout(() => onEdit(staff), 100);
                }}>
                    <i className="fas fa-edit me-2"></i>
                    Edit Staff
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StaffViewModal;