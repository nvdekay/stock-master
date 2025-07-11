import { useState } from 'react'; 
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import api from '../../../../api/axiosInstance';

function StaffCreateModal({ show, onHide, warehouse, onSuccess }) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        role: 'staff'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.fullName || !formData.username || !formData.email) {
            setError('Please fill in all required fields (Full Name, Username, Email)');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const userResponse = await api.post('/register', {
                fullName: formData.fullName,
                username: formData.username,
                email: formData.email,
                password: '123',
                role: formData.role
            });

            await api.put(`/users/${userResponse.data.user.id}`, {
                ...userResponse.data.user,
                enterpriseId: warehouse.enterpriseId,
                warehouseId: formData.role === 'staff' ? warehouse.id : null
            });

            setSuccess('Staff account created successfully! Default password is "123".');
            setTimeout(() => {
                onHide();
                onSuccess();
                resetForm();
            }, 2500);

        } catch (err) {
            console.error('Error creating staff:', err);
            setError(err.response?.data?.error || 'Failed to create staff account');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            username: '',
            email: '',
            role: 'staff'
        });
        setError('');
        setSuccess('');
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-user-plus me-2"></i>
                    Create New Staff Account
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
                            Staff will be assigned to this warehouse. Shippers work enterprise-wide.
                        </Form.Text>
                    </Form.Group>

                    <Alert variant="info">
                        <h6 className="mb-2">
                            <i className="fas fa-info-circle me-2"></i>
                            Account Information:
                        </h6>
                        <ul className="mb-0">
                            <li><strong>Default Password:</strong> <code>123</code></li>
                            <li><strong>Enterprise:</strong> {warehouse.enterpriseId}</li>
                            <li><strong>Warehouse:</strong> {formData.role === 'staff' ? warehouse.name : 'Enterprise-wide (for shippers)'}</li>
                        </ul>
                    </Alert>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Staff Account'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StaffCreateModal;
