import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import axios from 'axios';

const EditAccountModal = ({ user, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        role: '',
        enterpriseId: null,
        warehouseId: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [enterprises, setEnterprises] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enterprisesRes, warehousesRes] = await Promise.all([
                    axios.get('http://localhost:9999/enterprises'),
                    axios.get('http://localhost:9999/warehouses')
                ]);
                setEnterprises(enterprisesRes.data);
                setWarehouses(warehousesRes.data);
            } catch (err) {
                console.error("Failed to fetch enterprises or warehouses:", err);
                setError("Failed to load enterprise/warehouse data.");
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                fullName: user.fullName || '',
                email: user.email || '',
                role: user.role || '',
                enterpriseId: user.enterpriseId || '',
                warehouseId: user.warehouseId || '',
            });
            setError(null);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value === "" ? null : value // Convert empty string to null for IDs
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError(null);

        // Logic for manager: ensure they can only manage one enterprise, and warehouse is null
        let updatedFormData = { ...formData };
        if (updatedFormData.role === 'manager') {
            if (!updatedFormData.enterpriseId) {
                setError("Manager must be assigned to an Enterprise.");
                setLoading(false);
                return;
            }
            updatedFormData.warehouseId = null; // Manager cannot have a warehouse
        } else {
            // For other roles, enterprise and warehouse can be optional or required based on business logic
            // Here, we'll just allow them to be null if not selected
        }

        try {
            await axios.put(`http://localhost:9999/users/${user.id}`, updatedFormData);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to update account. ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Filter warehouses based on selected enterprise for staff
    const filteredWarehouses = formData.enterpriseId
        ? warehouses.filter(wh => wh.enterpriseId === formData.enterpriseId)
        : [];

    return (
        <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Account: {user?.username}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group controlId="formUsername" className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={true} // Username usually shouldn't be editable
                        />
                    </Form.Group>
                    <Form.Group controlId="formFullName" className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formEmail" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formRole" className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="staff">Staff</option>
                            <option value="buyer">Buyer</option>
                            <option value="shipper">Shipper</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Enterprise Selection */}
                    {(formData.role === 'manager' || formData.role === 'staff' || formData.role === 'shipper') && (
                        <Form.Group controlId="formEnterprise" className="mb-3">
                            <Form.Label>Enterprise</Form.Label>
                            <Form.Select
                                name="enterpriseId"
                                value={formData.enterpriseId || ''}
                                onChange={handleChange}
                                required={formData.role === 'manager' || formData.role === 'staff' || formData.role === 'shipper'}
                            >
                                <option value="">Select Enterprise</option>
                                {enterprises.map((enterprise) => (
                                    <option key={enterprise.id} value={enterprise.id}>
                                        {enterprise.name}
                                    </option>
                                ))}
                            </Form.Select>
                            {formData.role === 'manager' && !formData.enterpriseId && (
                                <Form.Text className="text-danger">Manager must be assigned to an Enterprise.</Form.Text>
                            )}
                        </Form.Group>
                    )}

                    {/* Warehouse Selection - Only for Staff */}
                    {formData.role === 'staff' && (
                        <Form.Group controlId="formWarehouse" className="mb-3">
                            <Form.Label>Warehouse</Form.Label>
                            <Form.Select
                                name="warehouseId"
                                value={formData.warehouseId || ''}
                                onChange={handleChange}
                                disabled={!formData.enterpriseId || formData.role !== 'staff'} // Disable if no enterprise or not staff
                            >
                                <option value="">Select Warehouse</option>
                                {filteredWarehouses.map((warehouse) => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name} ({warehouse.location})
                                    </option>
                                ))}
                            </Form.Select>
                            {!formData.enterpriseId && formData.role === 'staff' && (
                                <Form.Text className="text-muted">Select an Enterprise first to see warehouses.</Form.Text>
                            )}
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        <X size={16} className="me-2" />
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} className="me-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditAccountModal;