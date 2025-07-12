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

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await api.put(`/users/${staff.id}`, {
                ...staff,
                fullName: formData.fullName,
                username: formData.username,
                email: formData.email,
                role: formData.role,
                enterpriseId: warehouse.enterpriseId,
                warehouseId: formData.role === 'staff' ? warehouse.id : null
            });

            setSuccess('Staff information updated successfully!');
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
                                <Form.Label>Full Name *</Form.Label>
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
                                <Form.Label>Username *</Form.Label>
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
                        <Form.Label>Email Address *</Form.Label>
                        <Form.Control
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter email address"
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            disabled={loading}
                        >
                            <option value="staff">Warehouse Staff</option>
                            <option value="shipper">Shipper</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Changing role will update work location assignment
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
                            <li><strong>Warehouse:</strong> {formData.role === 'staff' ? warehouse.name : 'Enterprise-wide (for shippers)'}</li>
                            <li><strong>Current Role:</strong> {formData.role === 'staff' ? 'Warehouse Staff' : 'Shipper'}</li>
                        </ul>
                    </Alert>

                    {formData.role !== staff.role && (
                        <Alert variant="warning">
                            <strong>Role Change Warning:</strong> Changing from {staff.role} to {formData.role} will update the work location and permissions.
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
                            Update Staff
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StaffEditModal;