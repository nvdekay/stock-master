import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import api from '../../../api/axiosInstance';

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
                // Fetch only active enterprises
                const [enterprisesRes, warehousesRes] = await Promise.all([
                    api.get('/enterprises?status=active'),
                    api.get('/warehouses')
                ]);
                setEnterprises(enterprisesRes.data);
                setWarehouses(warehousesRes.data);
            } catch (err) {
                console.error("Failed to fetch enterprises or warehouses:", err);
                setError("Không thể tải dữ liệu doanh nghiệp/kho hàng.");
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

        let updatedFormData = { ...formData };

        // Logic for manager: ensure they can only manage one enterprise, and warehouse is null
        if (updatedFormData.role === 'manager') {
            if (!updatedFormData.enterpriseId) {
                setError("Quản lý phải được gán cho một Doanh nghiệp.");
                setLoading(false);
                return;
            }
            updatedFormData.warehouseId = null; // Manager cannot have a warehouse
        } else if (updatedFormData.role === 'staff' || updatedFormData.role === 'shipper') {
            if (!updatedFormData.enterpriseId) {
                setError("Nhân viên/Người giao hàng phải được gán cho một Doanh nghiệp.");
                setLoading(false);
                return;
            }
            // If role changes from staff to non-staff, clear warehouseId
            if (user.role === 'staff' && updatedFormData.role !== 'staff') {
                updatedFormData.warehouseId = null;
            }
        } else {
            // For admin, buyer, enterpriseId and warehouseId should be null
            updatedFormData.enterpriseId = null;
            updatedFormData.warehouseId = null;
        }

        try {
            await api.put(`/users/${user.id}`, updatedFormData);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Cập nhật tài khoản thất bại. ' + (err.response?.data || err.message));
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
                <Modal.Title className="fw-bold text-primary">Chỉnh sửa Tài khoản: {user?.username}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                    <Form.Group controlId="formUsername" className="mb-3">
                        <Form.Label>Tên người dùng</Form.Label>
                        <Form.Control
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={true} // Username usually shouldn't be editable
                            className="rounded-pill"
                        />
                    </Form.Group>
                    <Form.Group controlId="formFullName" className="mb-3">
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
                    <Form.Group controlId="formEmail" className="mb-3">
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
                    <Form.Group controlId="formRole" className="mb-3">
                        <Form.Label>Vai trò</Form.Label>
                        <Form.Select name="role" value={formData.role} onChange={handleChange} required className="rounded-pill">
                            <option value="admin">Quản trị viên</option>
                            <option value="manager">Quản lý</option>
                            <option value="staff">Nhân viên</option>
                            <option value="buyer">Người mua</option>
                            <option value="shipper">Người giao hàng</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Enterprise Selection */}
                    {(formData.role === 'manager' || formData.role === 'staff' || formData.role === 'shipper') && (
                        <Form.Group controlId="formEnterprise" className="mb-3">
                            <Form.Label>Doanh nghiệp</Form.Label>
                            <Form.Select
                                name="enterpriseId"
                                value={formData.enterpriseId || ''}
                                onChange={handleChange}
                                required={formData.role === 'manager' || formData.role === 'staff' || formData.role === 'shipper'}
                                className="rounded-pill"
                            >
                                <option value="">Chọn Doanh nghiệp</option>
                                {enterprises.map((enterprise) => (
                                    <option key={enterprise.id} value={enterprise.id}>
                                        {enterprise.name}
                                    </option>
                                ))}
                            </Form.Select>
                            {formData.role === 'manager' && !formData.enterpriseId && (
                                <Form.Text className="text-danger">Quản lý phải được gán cho một Doanh nghiệp.</Form.Text>
                            )}
                            {(formData.role === 'staff' || formData.role === 'shipper') && !formData.enterpriseId && (
                                <Form.Text className="text-danger">Nhân viên/Người giao hàng phải được gán cho một Doanh nghiệp.</Form.Text>
                            )}
                        </Form.Group>
                    )}

                    {/* Warehouse Selection - Only for Staff */}
                    {formData.role === 'staff' && (
                        <Form.Group controlId="formWarehouse" className="mb-3">
                            <Form.Label>Kho hàng</Form.Label>
                            <Form.Select
                                name="warehouseId"
                                value={formData.warehouseId || ''}
                                onChange={handleChange}
                                disabled={!formData.enterpriseId || formData.role !== 'staff'} // Disable if no enterprise or not staff
                                className="rounded-pill"
                            >
                                <option value="">Chọn Kho hàng</option>
                                {filteredWarehouses.map((warehouse) => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name} ({warehouse.location})
                                    </option>
                                ))}
                            </Form.Select>
                            {!formData.enterpriseId && formData.role === 'staff' && (
                                <Form.Text className="text-muted">Chọn một Doanh nghiệp trước để xem kho hàng.</Form.Text>
                            )}
                        </Form.Group>
                    )}
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
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save size={16} className="me-2" />
                                Lưu Thay đổi
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditAccountModal;
