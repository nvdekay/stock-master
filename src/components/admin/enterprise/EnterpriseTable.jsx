import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Badge,
    Spinner,
    Pagination,
    Form,
    InputGroup,
    Alert
} from 'react-bootstrap';
import { Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import EditEnterpriseModal from './EditEnterpriseModal';
import ToggleEnterpriseStatusModal from './ToggleEnterpriseStatusModal';

const EnterpriseTable = ({ refreshEnterprises }) => {
    const [enterprises, setEnterprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
    const [selectedEnterprise, setSelectedEnterprise] = useState(null);

    const fetchEnterprises = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('http://localhost:9999/enterprises');
            setEnterprises(res.data);
        } catch (err) {
            console.error('Failed to fetch enterprises:', err);
            setError('Không thể tải dữ liệu doanh nghiệp.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnterprises();
    }, [refreshEnterprises]);

    const handleEditClick = (enterprise) => {
        setSelectedEnterprise(enterprise);
        setIsEditModalOpen(true);
    };

    const handleToggleStatusClick = (enterprise) => {
        setSelectedEnterprise(enterprise);
        setIsToggleStatusModalOpen(true);
    };

    const filteredEnterprises = enterprises.filter(enterprise => {
        const matchesSearch = searchTerm === '' ||
            enterprise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || enterprise.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredEnterprises.length / pageSize);
    const pagedEnterprises = filteredEnterprises.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>,
            );
        }
        return (
            <Pagination className="justify-content-center mt-4">
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {items}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            </Pagination>
        );
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'banned': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <>
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex">
                            <InputGroup className="me-2" style={{ width: '250px' }}>
                                <Form.Control
                                    placeholder="Tìm kiếm doanh nghiệp..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-pill"
                                />
                            </InputGroup>
                            <Form.Group controlId="filterStatus">
                                <InputGroup>
                                    <Form.Select
                                        value={filterStatus}
                                        onChange={(e) => {
                                            setFilterStatus(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="rounded-pill"
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="banned">Banned</option>
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        </div>
                    </div>
                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </Spinner>
                            </div>
                        ) : (
                            <Table striped bordered hover className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên Doanh nghiệp</th>
                                        <th>Trạng thái</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedEnterprises.map((enterprise) => (
                                        <tr key={enterprise.id}>
                                            <td>{enterprise.id}</td>
                                            <td>{enterprise.name}</td>
                                            <td>
                                                <Badge bg={getStatusVariant(enterprise.status)} className="px-2 py-1 rounded-pill">
                                                    {enterprise.status === 'active' ? 'Active' : 'Banned'}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2 d-flex align-items-center rounded-pill"
                                                        onClick={() => handleEditClick(enterprise)}
                                                    >
                                                        <Edit size={14} className="me-1" /> Chỉnh sửa
                                                    </Button>
                                                    <Button
                                                        variant={enterprise.status === 'active' ? 'outline-danger' : 'outline-success'}
                                                        size="sm"
                                                        className="d-flex align-items-center rounded-pill"
                                                        onClick={() => handleToggleStatusClick(enterprise)}
                                                    >
                                                        {enterprise.status === 'active' ? (
                                                            <><Trash2 size={14} className="me-1" /> Ban</>
                                                        ) : (
                                                            <><Plus size={14} className="me-1" /> Unban</>
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pagedEnterprises.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-3 text-muted">
                                                No enterprises found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </div>
                    {renderPagination()}
                </div>
            </div>

            <EditEnterpriseModal
                enterprise={selectedEnterprise}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchEnterprises}
            />

            <ToggleEnterpriseStatusModal
                enterprise={selectedEnterprise}
                isOpen={isToggleStatusModalOpen}
                onClose={() => setIsToggleStatusModalOpen(false)}
                onSuccess={fetchEnterprises}
            />
        </>
    );
};

export default EnterpriseTable;
