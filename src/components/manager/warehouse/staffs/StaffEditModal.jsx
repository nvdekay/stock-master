import { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import api from '../../../../api/axiosInstance';

function StaffEditModal({ show, onHide, staff, warehouse, onSuccess }) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        role: 'staff'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (staff) {
            setFormData({
                fullName: staff.fullName || '',
                username: staff.username || '',
                email: staff.email || '',
                role: staff.role || 'staff'
            });
            setError('');
            setSuccess('');
        }
    }, [staff]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.fullName || !formData.username || !formData.email) {
            setError('Please fill in all required fields');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (!['staff', 'exporter', 'shipper'].includes(formData.role)) {
            setError('Invalid role selected');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const warehouseId = formData.role === 'shipper' ? null : warehouse.id;

            await api.put(`/users/${staff.id}`, {
                ...staff,
                fullName: formData.fullName,
                username: formData.username,
                email: formData.email,
                role: formData.role,
                enterpriseId: warehouse.enterpriseId,
                warehouseId: warehouseId
            });

            setSuccess(`${getRoleDisplayName(formData.role)} information updated successfully!`);
            setTimeout(() => {
                onHide();
                onSuccess();
            }, 1500);

        } catch (err) {
            console.error('Error updating staff:', err);
            setError(err.response?.data?.error || 'Failed to update staff information');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        setSuccess('');
        onHide();
    };

    const getRoleDisplayName = (role) => {
        const roleNames = {
            staff: 'Warehouse Staff',
            exporter: 'Export Staff',
            shipper: 'Shipper'
        };
        return roleNames[role] || role;
    };

    const getRoleDescription = (role) => {
        const descriptions = {
            staff: 'General warehouse operations and inventory management',
            exporter: 'Handle outgoing shipments and export documentation',
            shipper: 'Deliver wholesale orders and manage transportation'
        };
        return descriptions[role] || '';
    };

    if (!staff) return null;

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-user-edit me-2"></i>
                    Edit Staff Information
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    placeholder="Enter full name"
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    placeholder="Enter username"
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter email address"
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            disabled={loading}
                        >
                            <option value="staff">Warehouse Staff</option>
                            <option value="exporter">Export Staff</option>
                            <option value="shipper">Shipper</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            {getRoleDescription(formData.role)}
                        </Form.Text>
                    </Form.Group>

                    <Alert variant="info">
                        <h6 className="mb-2">
                            <i className="fas fa-info-circle me-2"></i>
                            Current Assignment:
                        </h6>
                        <ul className="mb-0">
                            <li><strong>Staff ID:</strong> {staff.id}</li>
                            <li><strong>Enterprise:</strong> {warehouse.enterpriseId}</li>
                            <li><strong>Warehouse Assignment:</strong> {
                                formData.role === 'shipper' 
                                    ? 'Enterprise-wide (no specific warehouse)'
                                    : warehouse.name
                            }</li>
                            <li><strong>Role:</strong> {getRoleDisplayName(formData.role)}</li>
                        </ul>
                    </Alert>

                    {formData.role !== staff.role && (
                        <Alert variant="warning">
                            <strong>Role Change Warning:</strong> Changing from {getRoleDisplayName(staff.role)} to {getRoleDisplayName(formData.role)} will update the work location and permissions.
                            {formData.role === 'shipper' && <br />}
                            {formData.role === 'shipper' && <strong>Note: Shipper role will remove warehouse assignment and enable enterprise-wide access.</strong>}
                        </Alert>
                    )}

                    {formData.role === 'shipper' && (
                        <Alert variant="info">
                            <strong>Shipper Role:</strong> This role allows access to all warehouses in the enterprise for delivery management.
                        </Alert>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Updating...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-save me-2"></i>
                            Update {getRoleDisplayName(formData.role)}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StaffEditModal;