import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Badge,
    Spinner,
    Pagination,
} from 'react-bootstrap';
import { Edit, Trash2 } from 'lucide-react';
import EditAccountModal from '../../components/admin/EditAccountModal';
import DeleteAccountModal from '../../components/admin/DeleteAccountModal';
import axios from 'axios';

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:9999/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const totalPages = Math.ceil(users.length / pageSize);
    const pagedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'admin': return 'danger';
            case 'manager': return 'warning';
            case 'staff': return 'dark';
            case 'buyer': return 'info';
            case 'shipper': return 'success';
            default: return 'secondary';
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="d-flex justify-content-end mt-3 px-3">
                <Pagination>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                            key={i + 1}
                            active={i + 1 === currentPage}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div>
        );
    };

    return (
        <>
            <div className="card shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" />
                            </div>
                        ) : (
                            <Table hover responsive className="mb-0">
                                <thead class="table-light border-bottom">
                                    <tr>
                                        <th class="px-3 py-3 text-start text-uppercase text-secondary fw-semibold small">
                                            Username
                                        </th>
                                        <th class="px-3 py-3 text-start text-uppercase text-secondary fw-semibold small">
                                            Full Name
                                        </th>
                                        <th class="px-3 py-3 text-start text-uppercase text-secondary fw-semibold small">
                                            Email
                                        </th>
                                        <th class="px-3 py-3 text-start text-uppercase text-secondary fw-semibold small">
                                            Role
                                        </th>
                                        <th class="px-3 py-3 text-start text-uppercase text-secondary fw-semibold small">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody class="border-top">
                                    {pagedUsers.map((user) => (
                                        <tr key={user.id} className="table-row align-middle table-hover">
                                            <td class="px-3 py-3 text-nowrap">
                                                <div class="text-body text-truncate fw-medium">{user.username}</div>
                                            </td>
                                            <td class="px-3 py-3 text-nowrap">
                                                <div class="text-body">{user.fullName}</div>
                                            </td>
                                            <td class="px-3 py-3 text-nowrap">
                                                <div class="text-muted small">{user.email}</div>
                                            </td>
                                            <td class="px-3 py-3 text-nowrap">
                                                <Badge bg={getRoleBadgeVariant(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td class="px-3 py-3 text-nowrap">
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="d-flex align-items-center"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit size={14} className="me-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="d-flex align-items-center"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 size={14} className="me-1" /> Delete
                                                    </Button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                    {pagedUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-3 text-muted">
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
                onSuccess={fetchUsers}
            />

            <DeleteAccountModal
                user={selectedUser}
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </>
    );
};

export default UserTable;
