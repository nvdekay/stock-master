import { useState } from 'react';
import { Table, Card, Badge, Button, Row, Col, Form, InputGroup, Nav, Modal } from 'react-bootstrap';
import api from '../../../api/axiosInstance';
import StaffCreateModal from './staffs/StaffCreateModal';
import StaffViewModal from './staffs/StaffViewModal';
import StaffEditModal from './staffs/StaffEditModal';

function WarehouseStaff({ warehouse, staff, shippers, manager, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const allEmployees = [...staff, ...shippers];

    const filteredEmployees = allEmployees.filter(member => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        const fullNameMatch = (member.fullName ?? '').toLowerCase().includes(lowerCaseSearchTerm);
        const emailMatch = (member.email ?? '').toLowerCase().includes(lowerCaseSearchTerm);
        const usernameMatch = (member.username ?? '').toLowerCase().includes(lowerCaseSearchTerm);

        return fullNameMatch || emailMatch || usernameMatch;
    });

    const filteredByTab = activeTab === 'all' ? filteredEmployees :
        activeTab === 'staff' ? filteredEmployees.filter(e => e.role === 'staff') :
            filteredEmployees.filter(e => e.role === 'shipper');

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

    const getWorkLocationBadge = (employee) => {
        if (employee.role === 'staff') {
            return <Badge bg="light" text="dark">Warehouse: {warehouse.name}</Badge>;
        } else if (employee.role === 'shipper') {
            return <Badge bg="light" text="dark">Enterprise-wide</Badge>;
        }
        return null;
    };

    const handleViewStaff = (staffMember) => {
        setSelectedStaff(staffMember);
        setShowViewModal(true);
    };

    const handleEditStaff = (staffMember) => {
        setSelectedStaff(staffMember);
        setShowEditModal(true);
    };

    const handleDeleteStaff = (staffMember) => {
        setSelectedStaff(staffMember);
        setDeleteError('');
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedStaff) return;

        setDeleteLoading(true);
        setDeleteError('');

        try {
            await api.delete(`/users/${selectedStaff.id}`);

            setShowDeleteModal(false);
            setSelectedStaff(null);
            onRefresh();
        } catch (err) {
            console.error('Error deleting staff:', err);
            setDeleteError(err.response?.data?.error || 'Failed to delete staff member');
        } finally {
            setDeleteLoading(false);
        }
    };


    const handleCloseModals = () => {
        setShowCreateModal(false);
        setShowViewModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedStaff(null);
        setDeleteError('');
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
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={8} className="text-end">
                    <Button
                        variant="success"
                        className="me-2"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="fas fa-plus me-2"></i>Add New Staff
                    </Button>
                </Col>
            </Row>

            {manager && (
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">
                            <i className="fas fa-user-tie me-2"></i>
                            Enterprise Manager
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-user text-white"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{manager.fullName}</h6>
                                        <small className="text-muted">{manager.email}</small>
                                        <div className="mt-1">
                                            {getRoleBadge(manager.role)}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="text-md-end">
                                    <div className="text-muted small">Username</div>
                                    <div className="fw-medium">{manager.username}</div>
                                    <div className="text-muted small mt-2">Manages entire enterprise</div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            <Card>
                <Card.Header>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                <i className="fas fa-users me-2"></i>
                                Employees ({allEmployees.length})
                            </h5>
                        </Col>
                    </Row>
                    <Nav variant="tabs" className="mt-3">
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'all'}
                                onClick={() => setActiveTab('all')}
                            >
                                All ({allEmployees.length})
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'staff'}
                                onClick={() => setActiveTab('staff')}
                            >
                                Warehouse Staff ({staff.length})
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'shipper'}
                                onClick={() => setActiveTab('shipper')}
                            >
                                Shippers ({shippers.length})
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Employee</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Work Location</th>
                                <th>Contact</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredByTab.length > 0 ? (
                                filteredByTab.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <div className={`bg-${member.role === 'staff' ? 'info' : 'success'} rounded-circle d-flex align-items-center justify-content-center`}
                                                        style={{ width: '40px', height: '40px' }}>
                                                        <i className={`fas fa-${member.role === 'staff' ? 'user' : 'truck'} text-white`}></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="fw-medium">{member.fullName}</div>
                                                    <small className="text-muted">ID: {member.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fw-medium">{member.username}</span>
                                        </td>
                                        <td>
                                            {getRoleBadge(member.role)}
                                        </td>
                                        <td>
                                            {getWorkLocationBadge(member)}
                                        </td>
                                        <td>
                                            <div>
                                                <div className="small">{member.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                className="me-1"
                                                onClick={() => handleViewStaff(member)}
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-1"
                                                onClick={() => handleEditStaff(member)}
                                                title="Edit Staff"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteStaff(member)}
                                                title="Delete Staff"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        <i className="fas fa-users fa-2x text-muted mb-2"></i>
                                        <div className="text-muted">No employees found</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Create Staff Modal */}
            <StaffCreateModal
                show={showCreateModal}
                onHide={handleCloseModals}
                warehouse={warehouse}
                onSuccess={onRefresh}
            />

            {/* View Staff Modal */}
            <StaffViewModal
                show={showViewModal}
                onHide={handleCloseModals}
                staff={selectedStaff}
                warehouse={warehouse}
                onEdit={handleEditStaff}
            />

            {/* Edit Staff Modal */}
            <StaffEditModal
                show={showEditModal}
                onHide={handleCloseModals}
                staff={selectedStaff}
                warehouse={warehouse}
                onSuccess={onRefresh}
            />

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseModals}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Confirm Delete Staff
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteError && (
                        <div className="alert alert-danger">{deleteError}</div>
                    )}

                    {selectedStaff && (
                        <div>
                            <p className="mb-3">
                                Are you sure you want to delete the following staff member?
                            </p>

                            <div className="border rounded p-3 bg-light mb-3">
                                <div className="d-flex align-items-center">
                                    <div className={`bg-${selectedStaff.role === 'staff' ? 'info' : 'success'} rounded-circle d-flex align-items-center justify-content-center me-3`}
                                        style={{ width: '40px', height: '40px' }}>
                                        <i className={`fas fa-${selectedStaff.role === 'staff' ? 'user' : 'truck'} text-white`}></i>
                                    </div>
                                    <div>
                                        <div className="fw-bold">{selectedStaff.fullName}</div>
                                        <div className="text-muted small">{selectedStaff.email}</div>
                                        <div className="mt-1">{getRoleBadge(selectedStaff.role)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <strong>Warning:</strong> This action cannot be undone. The staff member's account will be permanently deleted.
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModals} disabled={deleteLoading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={deleteLoading}>
                        {deleteLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-trash me-2"></i>
                                Delete Staff
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default WarehouseStaff;