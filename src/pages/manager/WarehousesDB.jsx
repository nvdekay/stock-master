import { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, InputGroup, Form, Button, Alert, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';
import ManagerSidebar from '../../components/manager/ManagerSidebar';
import WarehouseCard from '../../components/manager/WarehouseCard';
import WarehouseModal from '../../components/manager/WarehouseModal';

function WarehousesDB() {
    // === PHẦN 1: STATE MANAGEMENT ===
    
    const { user, loading: authLoading } = useAuth();
    
    // State cho dữ liệu từ API
    const [warehouses, setWarehouses] = useState([]);
    const [enterprise, setEnterprise] = useState(null);
    
    // State cho trạng thái của component
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho UI interactions
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Toast notifications
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // === PHẦN 2: LOGIC & DATA FETCHING ===

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
            const [enterpriseRes, warehouseRes, inventoryRes, usersRes] = await Promise.all([
                api.get(`/enterprises/${enterpriseId}`),
                api.get(`/warehouses?enterpriseId=${enterpriseId}`),
                api.get('/inventory'),
                api.get('/users')
            ]);
            
            const inventory = inventoryRes.data; 
            const users = usersRes.data;

            const mergedWarehouses = warehouseRes.data.map(w => ({
                ...w,
                productCount: new Set(inventory.filter(i => i.warehouseId === w.id).map(item => item.productId)).size,
                totalQuantity: inventory.filter(i => i.warehouseId === w.id).reduce((sum, i) => sum + i.quantity, 0),
                staffCount: users.filter(u => u.warehouseId === w.id && u.role === 'staff').length,
            }));

            setEnterprise(enterpriseRes.data);
            setWarehouses(mergedWarehouses);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError('Could not fetch warehouse data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) {
            return;
        }
        fetchData();
    }, [authLoading, fetchData]);

    const handleSubmit = useCallback(async (formData) => {
        if (!user?.enterpriseId) return;

        try {
            const payload = { ...formData, enterpriseId: user.enterpriseId };
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
            setToast({ show: true, message: 'Could not save warehouse data.', variant: 'danger' });
        }
    }, [user, editingWarehouse, fetchData]);

    const handleDelete = useCallback(async (id) => {
        const warehouse = warehouses.find(w => w.id === id);
        if (!warehouse) {
            setToast({ show: true, message: 'Warehouse not found.', variant: 'danger' });
            return;
        }

        // Kiểm tra xem warehouse có dữ liệu liên quan không
        if (warehouse.productCount > 0 || warehouse.staffCount > 0) {
            if (!window.confirm(
                `This warehouse contains ${warehouse.productCount} products and ${warehouse.staffCount} staff members. ` +
                'Deleting it may cause data inconsistency. Are you sure you want to continue?'
            )) {
                return;
            }
        } else {
            if (!window.confirm(`Are you sure you want to delete "${warehouse.name}"?`)) {
                return;
            }
        }

        try {
            // Trước khi xóa warehouse, có thể cần xóa hoặc cập nhật dữ liệu liên quan
            const inventoryToDelete = await api.get(`/inventory?warehouseId=${id}`);
            const usersToUpdate = await api.get(`/users?warehouseId=${id}`);

            // Xóa inventory liên quan
            const deleteInventoryPromises = inventoryToDelete.data.map(item =>
                api.delete(`/inventory/${item.id}`)
            );

            // Cập nhật users để loại bỏ warehouseId
            const updateUsersPromises = usersToUpdate.data.map(user =>
                api.put(`/users/${user.id}`, { ...user, warehouseId: null })
            );

            // Thực hiện tất cả các thao tác song song
            await Promise.all([...deleteInventoryPromises, ...updateUsersPromises]);

            // Cuối cùng xóa warehouse
            await api.delete(`/warehouses/${id}`);

            setToast({ show: true, message: 'Warehouse deleted successfully!', variant: 'success' });
            await fetchData();
        } catch (err) {
            console.error("Failed to delete warehouse:", err);
            
            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = 'Could not delete the warehouse.';
            if (err.response?.status === 404) {
                errorMessage = 'Warehouse not found.';
            } else if (err.response?.status === 400) {
                errorMessage = 'Cannot delete warehouse: it may contain related data.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setToast({ show: true, message: errorMessage, variant: 'danger' });
        }
    }, [warehouses, fetchData]);

    // === PHẦN 3: DERIVED STATE & UI HANDLERS ===
    
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

    // === PHẦN 4: RENDER JSX ===
    
    if (authLoading || loading) {
        return (
            <div className="d-flex vh-100 align-items-center justify-content-center">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <ManagerSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

            <main style={{ marginLeft: isSidebarCollapsed ? '0px' : '260px', transition: 'margin-left 0.3s ease-in-out' }}>
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
            </main>

            <WarehouseModal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                warehouse={editingWarehouse}
                onSubmit={handleSubmit}
            />

            {/* Toast Notifications */}
            <ToastContainer position="top-end" className="p-3">
                <Toast 
                    show={toast.show} 
                    onClose={() => setToast({ ...toast, show: false })}
                    autohide
                    delay={4000}
                    bg={toast.variant}
                >
                    <Toast.Header>
                        <strong className="me-auto">
                            {toast.variant === 'success' ? 'Success' : 'Error'}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}

export default WarehousesDB;