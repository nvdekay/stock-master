import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { UserPlus, X } from 'lucide-react';
import axios from 'axios';

const AddManagerModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '', // Add password for new manager
        role: 'manager', // Default to manager
        enterpriseId: '',
        warehouseId: null, // Manager should not have a warehouse
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [enterprises, setEnterprises] = useState([]);

    useEffect(() => {
        const fetchEnterprises = async () => {
            try {
                const res = await axios.get('http://localhost:9999/enterprises');
                setEnterprises(res.data);
            } catch (err) {
                console.error("Failed to fetch enterprises:", err);
                setError("Failed to load enterprise data.");
            }
        };
        fetchEnterprises();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value === "" ? null : value // Convert empty string for IDs to null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.enterpriseId) {
            setError("Please select an Enterprise for the new Manager.");
            setLoading(false);
            return;
        }

        try {
            // Check if username or email already exists (optional, but good practice)
            const usersRes = await axios.get(`http://localhost:9999/users?username=${formData.username}`);
            if (usersRes.data.length > 0) {
                setError("Username already exists.");
                setLoading(false);
                return;
            }
            const emailRes = await axios.get(`http://localhost:9999/users?email=${formData.email}`);
            if (emailRes.data.length > 0) {
                setError("Email already exists.");
                setLoading(false);
                return;
            }

            // Simple password hashing for demonstration. In a real app, use a proper backend for hashing.
            // For json-server, we'll just store as plain text for simplicity or omit if not needed for frontend logic.
            // If you have a backend, you'd send plain password and let backend hash it.
            const newUser = {
                ...formData,
                id: (Math.random() * 100000).toFixed(0).toString(), // Generate a simple ID
                warehouseId: null // Ensure manager has no warehouse
            };

            await axios.post('http://localhost:9999/users', newUser);
            onSuccess(); // Trigger refresh in parent component
            onClose();
            // Reset form
            setFormData({
                username: '',
                fullName: '',
                email: '',
                password: '',
                role: 'manager',
                enterpriseId: '',
                warehouseId: null,
            });
        } catch (err) {
            console.error(err);
            setError('Failed to add manager. ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Manager Account</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group controlId="formNewUsername" className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formNewPassword" className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formNewFullName" className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formNewEmail" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formNewEnterprise" className="mb-3">
                        <Form.Label>Assign Enterprise</Form.Label>
                        <Form.Select
                            name="enterpriseId"
                            value={formData.enterpriseId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Enterprise</option>
                            {enterprises.map((enterprise) => (
                                <option key={enterprise.id} value={enterprise.id}>
                                    {enterprise.name}
                                </option>
                            ))}
                        </Form.Select>
                        {!formData.enterpriseId && (
                            <Form.Text className="text-danger">Manager must be assigned to an Enterprise.</Form.Text>
                        )}
                    </Form.Group>
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
                                Adding...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} className="me-2" />
                                Add Manager
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddManagerModal;