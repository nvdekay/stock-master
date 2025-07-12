// src/pages/admin/AdminManageWarehouse.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Card, Spinner, Alert, Modal, Form, Pagination } from 'react-bootstrap'; // Import Pagination
import { Warehouse, Plus, Search } from 'lucide-react';

// Components con
import WarehouseList from '../../components/admin/warehouse/WarehouseList';
import WarehouseForm from '../../components/admin/warehouse/WarehouseForm';
import WarehouseDetail from '../../components/admin/warehouse/WarehouseDetail';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';

function AdminManageWarehouse() {
    const [warehouses, setWarehouses] = useState([]);
    const [enterprises, setEnterprises] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States for Search and Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEnterpriseId, setFilterEnterpriseId] = useState('');

    // States for Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10); // 10 bản ghi mỗi trang

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [warehousesRes, enterprisesRes] = await Promise.all([
                axios.get('http://localhost:9999/warehouses'),
                axios.get('http://localhost:9999/enterprises')
            ]);
            setWarehouses(warehousesRes.data);
            setEnterprises(enterprisesRes.data);
            setCurrentPage(1); // Reset về trang đầu tiên khi dữ liệu thay đổi
        } catch (err) {
            console.error('Lỗi khi lấy dữ liệu:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Memoized filtered warehouses based on search term and enterprise filter
    const filteredWarehouses = useMemo(() => {
        let filtered = warehouses;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(warehouse =>
                warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply enterprise filter
        if (filterEnterpriseId) {
            filtered = filtered.filter(warehouse =>
                String(warehouse.enterpriseId) === String(filterEnterpriseId)
            );
        }

        return filtered;
    }, [warehouses, searchTerm, filterEnterpriseId]);

    // Calculate pagination data
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredWarehouses.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredWarehouses.length / recordsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAddWarehouse = () => {
        setSelectedWarehouse(null);
        setFormMode('add');
        setShowFormModal(true);
    };

    const handleEditWarehouse = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setFormMode('edit');
        setShowFormModal(true);
    };

    const handleDeleteWarehouse = async (warehouseId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa kho hàng này? Việc này có thể ảnh hưởng đến dữ liệu liên quan và không thể hoàn tác.')) {
            try {
                setLoading(true);
                // Kiểm tra các ràng buộc trước khi xóa
                const [usersRes, inventoryRes, ordersSendRes, ordersReceiveRes, shipmentsSendRes] = await Promise.all([
                    axios.get(`http://localhost:9999/users?warehouseId=${warehouseId}`),
                    axios.get(`http://localhost:9999/inventory?warehouseId=${warehouseId}`),
                    axios.get(`http://localhost:9999/orders?sendWarehouseId=${warehouseId}`),
                    axios.get(`http://localhost:9999/orders?receiveWarehouseId=${warehouseId}`),
                    axios.get(`http://localhost:9999/shipments?sendWarehouseId=${warehouseId}`)
                ]);

                if (usersRes.data.length > 0 || inventoryRes.data.length > 0 || ordersSendRes.data.length > 0 || ordersReceiveRes.data.length > 0 || shipmentsSendRes.data.length > 0) {
                    alert('Không thể xóa kho hàng này vì có dữ liệu liên quan (người dùng, tồn kho, đơn hàng gửi/nhận, lô hàng gửi). Vui lòng xử lý các liên kết này trước.');
                    setLoading(false);
                    return;
                }

                await axios.delete(`http://localhost:9999/warehouses/${warehouseId}`);
                fetchData(); // Tải lại danh sách sau khi xóa
                alert('Kho hàng đã được xóa thành công!');
            } catch (err) {
                console.error('Lỗi khi xóa kho hàng:', err);
                setError('Đã xảy ra lỗi khi xóa kho hàng.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveWarehouse = async (warehouseData) => {
        try {
            setLoading(true);
            if (formMode === 'add') {
                await axios.post('http://localhost:9999/warehouses', warehouseData);
                alert('Thêm kho hàng thành công!');
            } else {
                await axios.put(`http://localhost:9999/warehouses/${warehouseData.id}`, warehouseData);
                alert('Cập nhật kho hàng thành công!');
            }
            setShowFormModal(false);
            fetchData(); // Tải lại danh sách sau khi lưu
        } catch (err) {
            console.error('Lỗi khi lưu kho hàng:', err);
            setError('Đã xảy ra lỗi khi lưu kho hàng.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setViewMode('detail');
        setShowFormModal(false);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedWarehouse(null);
        fetchData(); // Đảm bảo dữ liệu mới nhất khi quay lại
    };

    return (
        <div className="vh-100 overflow-hidden d-flex flex-column">
            <Header />
            <div className="d-flex flex-grow-1 overflow-hidden">
                <div className="bg-white border-end" style={{ width: '16rem', height: 'calc(100vh - 64px)' }}>
                    <Sidebar />
                </div>
                <div className="flex-grow-1 overflow-auto p-4">
                    <Container fluid>
                        {/* Header section */}
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <div className="d-flex align-items-center mb-2">
                                    <Warehouse className="text-primary me-2" size={28} />
                                    <h2 className="h3 mb-0">Warehouse Management</h2>
                                </div>
                                <p className="text-muted">Manage warehouses, location and permissions</p>
                            </div>
                            {viewMode === 'list' && (
                                <Button
                                    variant="primary"
                                    className="d-flex align-items-center rounded-pill px-4 py-2 shadow-sm"
                                    onClick={handleAddWarehouse}
                                >
                                    <Plus className="me-2" size={16} />
                                    Add New Warehouse
                                </Button>
                            )}
                        </div>

                        {/* Search and Filter Section */}
                        {viewMode === 'list' && (
                            <Card className="mb-4 shadow-sm">
                                <Card.Body>
                                    <Row className="align-items-center">
                                        <Col md={6} lg={4} className="mb-3 mb-md-0">
                                            <Form.Group controlId="searchWarehouse">
                                                <Form.Label className="visually-hidden">Tìm kiếm theo tên kho</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Tìm kiếm theo tên kho..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                    <Search size={18} className="position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} lg={4}>
                                            <Form.Group controlId="filterEnterprise">
                                                <Form.Label className="visually-hidden">Lọc theo doanh nghiệp</Form.Label>
                                                <Form.Select
                                                    value={filterEnterpriseId}
                                                    onChange={(e) => setFilterEnterpriseId(e.target.value)}
                                                >
                                                    <option value="">Tất cả Doanh nghiệp</option>
                                                    {enterprises.map(enterprise => (
                                                        <option key={enterprise.id} value={enterprise.id}>
                                                            {enterprise.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        )}

                        {loading && (
                            <div className="text-center my-4">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </Spinner>
                            </div>
                        )}
                        {error && <Alert variant="danger">{error}</Alert>}

                        {!loading && !error && (
                            <>
                                {viewMode === 'list' && (
                                    <>
                                        <WarehouseList
                                            warehouses={currentRecords} // Truyền dữ liệu đã phân trang
                                            enterprises={enterprises}
                                            onEdit={handleEditWarehouse}
                                            onDelete={handleDeleteWarehouse}
                                            onViewDetail={handleViewDetail}
                                        />
                                        {totalPages > 1 && ( // Chỉ hiển thị phân trang nếu có nhiều hơn 1 trang
                                            <div className="d-flex justify-content-center mt-4">
                                                <Pagination>
                                                    <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                                                    <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                                                    {[...Array(totalPages)].map((_, index) => (
                                                        <Pagination.Item
                                                            key={index + 1}
                                                            active={index + 1 === currentPage}
                                                            onClick={() => paginate(index + 1)}
                                                        >
                                                            {index + 1}
                                                        </Pagination.Item>
                                                    ))}
                                                    <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                                                    <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                                                </Pagination>
                                            </div>
                                        )}
                                    </>
                                )}

                                {viewMode === 'detail' && selectedWarehouse && (
                                    <WarehouseDetail
                                        warehouse={selectedWarehouse}
                                        enterprises={enterprises}
                                        onBack={handleBackToList}
                                    />
                                )}
                            </>
                        )}

                        {/* Form Modal for Add/Edit */}
                        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>{formMode === 'add' ? 'Thêm Kho hàng mới' : 'Sửa Kho hàng'}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <WarehouseForm
                                    initialData={selectedWarehouse}
                                    onSave={handleSaveWarehouse}
                                    onCancel={() => setShowFormModal(false)}
                                    enterprises={enterprises}
                                />
                            </Modal.Body>
                        </Modal>
                    </Container>
                </div>
            </div>
        </div>
    );
}

export default AdminManageWarehouse;