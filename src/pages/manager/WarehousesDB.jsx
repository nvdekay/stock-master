import { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, InputGroup, Form, Button, Alert, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';
import WarehouseCard from '../../components/manager/WarehouseCard';
import WarehouseModal from '../../components/manager/WarehouseModal';

function WarehousesDB() {
    const { user, loading: authLoading } = useAuth();

    const [warehouses, setWarehouses] = useState([]);
    const [enterprise, setEnterprise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    const fetchData = useCallback(async () => {
        if (!user || !user.enterpriseId) {
            setError('User is not assigned to any enterprise.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const enterpriseId = user.enterpriseId;

            const [enterpriseRes, warehousesRes] = await Promise.all([
                api.get(`/enterprises/${enterpriseId}`),
                api.get(`/warehouses?enterpriseId=${enterpriseId}`)
            ]);

            const enterpriseData = enterpriseRes.data;
            const enterpriseWarehouses = warehousesRes.data;

            if (enterpriseWarehouses.length === 0) {
                setEnterprise(enterpriseData);
                setWarehouses([]);
                setLoading(false);
                return;
            }
            const warehouseIdQuery = enterpriseWarehouses.map(w => `warehouseId=${w.id}`).join('&');

            const [inventoryRes, usersRes] = await Promise.all([
                api.get(`/inventory?${warehouseIdQuery}`),
                api.get(`/users?${warehouseIdQuery}`)
            ]);

            const relevantInventory = inventoryRes.data;
            const relevantUsers = usersRes.data;

            const mergedWarehouses = enterpriseWarehouses.map(w => {
                const warehouseInventory = relevantInventory.filter(i => i.warehouseId === w.id);
                return {
                    ...w,
                    productCount: new Set(warehouseInventory.map(item => item.productId)).size,
                    totalQuantity: warehouseInventory.reduce((sum, i) => sum + i.quantity, 0),
                    staffCount: relevantUsers.filter(u => u.warehouseId === w.id && u.role === 'staff').length,
                };
            });

            setEnterprise(enterpriseData);
            setWarehouses(mergedWarehouses);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError('Could not fetch warehouse data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;
        fetchData();
    }, [authLoading, fetchData]);

    const handleSubmit = useCallback(async (formData) => {
        if (!user?.enterpriseId) return;
        try {
            let payload = { ...formData, enterpriseId: user.enterpriseId };
            console.log("Submitting warehouse data:", payload);

            if (!editingWarehouse) {
                const res = await api.get(`/warehouses`);
                const latest = res.data;
                console.log("Latest warehouses fetched:", latest);
                const maxId = Math.max(0, ...latest.map(w => parseInt(w.id) || 0));
                payload.id = String(maxId + 1);
            }

            if (editingWarehouse) {
                await api.put(`/warehouses/${editingWarehouse.id}`, payload);
                setToast({ show: true, message: 'Warehouse updated successfully!', variant: 'success' });
            } else {
                await api.post('/warehouses', payload);
                setToast({ show: true, message: 'Warehouse created successfully!', variant: 'success' });
            }

            setIsModalOpen(false);
            setEditingWarehouse(null);
            await fetchData();
        } catch (err) {
            console.error("Failed to save warehouse:", err);
            setToast({
                show: true,
                message: err.response?.data?.error || 'Could not save warehouse data.',
                variant: 'danger'
            });
        }
    }, [user, editingWarehouse, fetchData]);

    const handleDelete = useCallback(async (id) => {
        const warehouseToDelete = warehouses.find(w => w.id === id);
        if (!warehouseToDelete) return;

        if (warehouseToDelete.staffCount > 0) {
            setToast({ show: true, message: `Cannot delete. Warehouse "${warehouseToDelete.name}" still has staff.`, variant: 'danger' });
            return;
        }
        if (warehouseToDelete.totalQuantity > 0) {
            setToast({ show: true, message: `Cannot delete. Warehouse "${warehouseToDelete.name}" is not empty.`, variant: 'danger' });
            return;
        }
        if (!window.confirm(`Are you sure you want to permanently delete warehouse "${warehouseToDelete.name}"?`)) {
            return;
        }
        try {
            await api.delete(`/warehouses/${id}`);
            setToast({ show: true, message: 'Warehouse deleted successfully!', variant: 'success' });
            await fetchData(); 
        } catch (err) {
            console.error("Failed to delete warehouse:", err);
            setToast({
                show: true,
                message: err.response?.data?.error || 'Could not delete the warehouse.',
                variant: 'danger'
            });
        }

    }, [warehouses, fetchData]);

    const isOwner = ['manager', 'admin'].includes(user?.role);

    const filteredWarehouses = useMemo(() =>
        warehouses.filter(w =>
            w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.location?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [warehouses, searchTerm]);

    const openModal = (warehouse = null) => {
        setEditingWarehouse(warehouse);
        setIsModalOpen(true);
    };

    if (authLoading || loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <>
            <header className="p-4 bg-white border-bottom">
                <Row className="align-items-center">
                    <Col>
                        <h4 className="mb-1 mt-2">Warehouse Management ({filteredWarehouses.length})</h4>
                        {enterprise && <p className="text-muted mb-0">Enterprise: {enterprise.name}</p>}
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center gap-3">
                        <InputGroup style={{ width: '300px' }}>
                            <InputGroup.Text><i className="fas fa-search" /></InputGroup.Text>
                            <Form.Control
                                type="search"
                                placeholder="Search by name or location..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        {isOwner && (
                            <Button variant="primary" onClick={() => openModal()}>
                                <i className="fas fa-plus me-2" />Add Warehouse
                            </Button>
                        )}
                    </Col>
                </Row>
            </header>

            <div className="p-4">
                {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

                {filteredWarehouses.length > 0 ? (
                    <Row className="g-4">
                        {filteredWarehouses.map(wh => (
                            <Col key={wh.id} lg={4} md={6}>
                                <WarehouseCard
                                    warehouse={wh}
                                    onEdit={() => openModal(wh)}
                                    onDelete={() => handleDelete(wh.id)}
                                    isOwner={isOwner}
                                />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="text-center py-5">
                        <i className="fas fa-warehouse text-muted mb-3" style={{ fontSize: '48px' }} />
                        <h5>No Warehouses Found</h5>
                        <p className="text-muted">
                            {searchTerm
                                ? 'No warehouses match your search criteria.'
                                : isOwner
                                    ? 'Create the first warehouse for your enterprise.'
                                    : 'No warehouses have been created yet.'}
                        </p>
                        {isOwner && !searchTerm && (
                            <Button variant="primary" onClick={() => openModal()}>
                                <i className="fas fa-plus me-2" />Create First Warehouse
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <WarehouseModal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                warehouse={editingWarehouse}
                onSubmit={handleSubmit}
            />

            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast
                    show={toast.show}
                    onClose={() => setToast({ ...toast, show: false })}
                    autohide
                    delay={5000}
                    bg={toast.variant}
                >
                    <Toast.Header closeButton={false}>
                        <strong className="me-auto text-capitalize">
                            {toast.variant}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default WarehousesDB;