import { Modal, Row, Col, Card, Button, Badge } from 'react-bootstrap';

function StaffViewModal({ show, onHide, staff, warehouse, onEdit }) {
    if (!staff) return null;

    const getRoleBadge = (role) => {
        const roleConfig = {
            manager: { bg: 'primary', text: 'Manager' },
            staff: { bg: 'info', text: 'Warehouse Staff' },
            shipper: { bg: 'success', text: 'Shipper' },
            admin: { bg: 'danger', text: 'Admin' }
        };
        
        const config = roleConfig[role] || { bg: 'secondary', text: role };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const getWorkLocation = () => {
        if (staff.role === 'staff' && staff.warehouseId) {
            return warehouse.name;
        } else if (staff.role === 'shipper') {
            return 'Enterprise-wide';
        }
        return 'Not assigned';
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
                                    <div className={`bg-${staff.role === 'staff' ? 'info' : 'success'} rounded-circle d-flex align-items-center justify-content-center mx-auto`} 
                                         style={{ width: '80px', height: '80px' }}>
                                        <i className={`fas fa-${staff.role === 'staff' ? 'user' : 'truck'} text-white fa-2x`}></i>
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
                                
                                <div className="mt-4">
                                    <h6>Responsibilities:</h6>
                                    <ul className="text-muted small">
                                        {staff.role === 'staff' ? (
                                            <>
                                                <li>Manage warehouse inventory</li>
                                                <li>Process internal transfers</li>
                                                <li>Handle stock management</li>
                                                <li>Coordinate with other warehouses</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Deliver wholesale orders</li>
                                                <li>Handle shipments</li>
                                                <li>Coordinate deliveries</li>
                                                <li>Manage transportation logistics</li>
                                            </>
                                        )}
                                    </ul>
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