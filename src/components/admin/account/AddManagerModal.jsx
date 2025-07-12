import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { UserPlus, X } from 'lucide-react';
import axios from 'axios';

const AddManagerModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'manager',
        enterpriseId: null, // Will be set after enterprise creation/lookup
        warehouseId: null,
    });
    const [enterpriseName, setEnterpriseName] = useState(''); // State for new enterprise name
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // No need to fetch enterprises anymore as we're creating a new one or linking by name

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value === "" ? null : value
        }));
    };

    const handleEnterpriseNameChange = (e) => {
        setEnterpriseName(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!enterpriseName.trim()) {
            setError("Tên doanh nghiệp không được để trống.");
            setLoading(false);
            return;
        }

        // Validation for manager role
        if (formData.role === 'manager' && formData.warehouseId !== null) {
            setError("Quản lý không được gán cho một Kho hàng.");
            setLoading(false);
            return;
        }

        try {
            // Check if username or email already exists
            const usersRes = await axios.get(`http://localhost:9999/users?username=${formData.username}`);
            if (usersRes.data.length > 0) {
                setError("Tên người dùng đã tồn tại.");
                setLoading(false);
                return;
            }
            const emailRes = await axios.get(`http://localhost:9999/users?email=${formData.email}`);
            if (emailRes.data.length > 0) {
                setError("Email đã tồn tại.");
                setLoading(false);
                return;
            }

            let newEnterpriseId;
            // Check if enterprise name already exists
            const existingEnterprisesRes = await axios.get(`http://localhost:9999/enterprises?name=${enterpriseName.trim()}`);

            if (existingEnterprisesRes.data.length > 0) {
                // If enterprise exists, use its ID
                newEnterpriseId = existingEnterprisesRes.data[0].id;
            } else {
                // If enterprise does not exist, create a new one
                const newEnterprise = {
                    id: (Math.random() * 100000).toFixed(0).toString(),
                    name: enterpriseName.trim(),
                    status: 'active' // Default status to active
                };
                const enterprisePostRes = await axios.post('http://localhost:9999/enterprises', newEnterprise);
                newEnterpriseId = enterprisePostRes.data.id;
            }

            const newUser = {
                ...formData,
                id: (Math.random() * 100000).toFixed(0).toString(),
                enterpriseId: newEnterpriseId, // Assign the new/existing enterprise ID
                warehouseId: null // Ensure warehouseId is null for managers
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
                enterpriseId: null,
                warehouseId: null,
            });
            setEnterpriseName(''); // Reset enterprise name field
        } catch (err) {
            console.error(err);
            setError('Thêm quản lý thất bại. ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold text-primary">Thêm Tài khoản Quản lý Mới</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                    <Form.Group controlId="formNewUsername" className="mb-3">
                        <Form.Label>Tên người dùng</Form.Label>
                        <Form.Control
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="rounded-pill"
                        />
                    </Form.Group>
                    <Form.Group controlId="formNewPassword" className="mb-3">
                        <Form.Label>Mật khẩu</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="rounded-pill"
                        />
                    </Form.Group>
                    <Form.Group controlId="formNewFullName" className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="rounded-pill"
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
                            className="rounded-pill"
                        />
                    </Form.Group>
                    <Form.Group controlId="formNewEnterpriseName" className="mb-3">
                        <Form.Label>Tên Doanh nghiệp</Form.Label>
                        <Form.Control
                            type="text"
                            name="enterpriseName"
                            value={enterpriseName}
                            onChange={handleEnterpriseNameChange}
                            required
                            className="rounded-pill"
                        />
                        {!enterpriseName.trim() && (
                            <Form.Text className="text-danger">Quản lý phải được gán cho một Doanh nghiệp.</Form.Text>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading} className="rounded-pill px-4 py-2">
                        <X size={16} className="me-2" />
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading} className="rounded-pill px-4 py-2">
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang thêm...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} className="me-2" />
                                Thêm Quản lý
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddManagerModal;
