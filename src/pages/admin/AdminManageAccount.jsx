import React from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { Users, Plus } from 'lucide-react';
import UserTable from '../../components/admin/UserTable';

function AdminManageAccount() {
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
                            <button className="btn btn-primary d-flex align-items-center">
                                <Plus className="me-2" size={16} />
                                Add User
                            </button>
                        </div>

                        {/* User Table */}
                        <UserTable />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminManageAccount;
