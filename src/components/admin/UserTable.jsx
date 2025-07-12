import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Badge,
    Spinner,
    Pagination,
    Form,
    InputGroup,
} from 'react-bootstrap';
import { Edit, Trash2, Search, Filter } from 'lucide-react';
import EditAccountModal from '../../components/admin/EditAccountModal';
import DeleteAccountModal from '../../components/admin/DeleteAccountModal';
import axios from 'axios';

const UserTable = ({ refreshUsers }) => { // Accept refreshUsers prop
    const [users, setUsers] = useState([]);
    const [enterprises, setEnterprises] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [usersRes, enterprisesRes, warehousesRes] = await Promise.all([
                axios.get('http://localhost:9999/users'),
                axios.get('http://localhost:9999/enterprises'),
                axios.get('http://localhost:9999/warehouses')
            ]);

            setUsers(usersRes.data);
            setEnterprises(enterprisesRes.data);
            setWarehouses(warehousesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [refreshUsers]); // Re-fetch data when refreshUsers changes

    const getEnterpriseName = (id) => {
        const enterprise = enterprises.find(e => e.id === id);
        return enterprise ? enterprise.name : 'N/A';
    };

    const getWarehouseName = (id) => {
        const warehouse = warehouses.find(w => w.id === id);
        return warehouse ? `${warehouse.name} (${warehouse.location})` : 'N/A';
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === '' ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getEnterpriseName(user.enterpriseId).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getWarehouseName(user.warehouseId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === '' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const pagedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

    const getRoleVariant = (role) => {
        switch (role) {
            case 'admin': return 'danger';
            case 'manager': return 'primary';
            case 'staff': return 'info';
            case 'buyer': return 'success';
            case 'shipper': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <>
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="card-title mb-0">User Accounts</h4>
                        <div className="d-flex">
                            <InputGroup className="me-2" style={{ width: '250px' }}>
                                <InputGroup.Text><Search size={16} /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Reset to first page on search
                                    }}
                                />
                            </InputGroup>
                            <Form.Group controlId="filterRole">
                                <InputGroup>
                                    <InputGroup.Text><Filter size={16} /></InputGroup.Text>
                                    <Form.Select
                                        value={filterRole}
                                        onChange={(e) => {
                                            setFilterRole(e.target.value);
                                            setCurrentPage(1); // Reset to first page on filter
                                        }}
                                    >
                                        <option value="">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="staff">Staff</option>
                                        <option value="buyer">Buyer</option>
                                        <option value="shipper">Shipper</option>
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        </div>
                    </div>
                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : (
                            <Table striped bordered hover className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Enterprise</th>
                                        <th>Warehouse</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <Badge bg={getRoleVariant(user.role)}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Badge>
                                            </td>
                                            <td>{user.enterpriseId ? getEnterpriseName(user.enterpriseId) : 'N/A'}</td>
                                            <td>{user.warehouseId ? getWarehouseName(user.warehouseId) : 'N/A'}</td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2 d-flex align-items-center"
                                                        onClick={() => handleEditClick(user)}
                                                    >
                                                        <Edit size={14} className="me-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="d-flex align-items-center"
                                                        onClick={() => handleDeleteClick(user)}
                                                    >
                                                        <Trash2 size={14} className="me-1" /> Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pagedUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-3 text-muted">
                                                No users found.
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

            <EditAccountModal
                user={selectedUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchAllData} // Re-fetch all data after successful edit
            />

            <DeleteAccountModal
                user={selectedUser}
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={fetchAllData} // Re-fetch all data after successful delete
            />
        </>
    );
};

export default UserTable;