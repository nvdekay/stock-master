import React, { useState } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { Users, Plus } from 'lucide-react';
import UserTable from '../../components/admin/UserTable';
import AddManagerModal from '../../components/admin/AddManagerModal'; // Import the new modal

function AdminManageAccount() {
    const [isAddManagerModalOpen, setIsAddManagerModalOpen] = useState(false);
    const [refreshUsers, setRefreshUsers] = useState(false); // State to trigger user table refresh

    const handleManagerAdded = () => {
        setRefreshUsers(prev => !prev); // Toggle to trigger re-fetch in UserTable
    };

    return (
        <div className="vh-100 overflow-hidden d-flex flex-column">
            <Header />

            <div className="d-flex flex-grow-1 overflow-hidden">
                <div className="bg-white border-end" style={{ width: '16rem', height: 'calc(100vh - 64px)' }}>
                    <Sidebar />
                </div>

                <div className="flex-grow-1 overflow-auto p-4">
                    <div className="container-fluid">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <div className="d-flex align-items-center mb-2">
                                    <Users className="text-primary me-2" size={28} />
                                    <h2 className="h3 mb-0">Manage Accounts</h2>
                                </div>
                                <p className="text-muted">Manage user accounts, roles, and permissions.</p>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => setIsAddManagerModalOpen(true)}
                            >
                                <Plus className="me-2" size={16} />
                                Add New Manager
                            </button>
                        </div>

                        {/* User Table */}
                        <UserTable refreshUsers={refreshUsers} />
                    </div>
                </div>
            </div>

            <AddManagerModal
                isOpen={isAddManagerModalOpen}
                onClose={() => setIsAddManagerModalOpen(false)}
                onSuccess={handleManagerAdded}
            />
        </div>
    );
}

export default AdminManageAccount;