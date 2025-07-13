import { useState } from 'react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { Building, Plus } from 'lucide-react';
import EnterpriseTable from '../../components/admin/enterprise/EnterpriseTable';
import AddEnterpriseModal from '../../components/admin/enterprise/AddEnterpriseModal';

function AdminManageEnterprise() {
  const [isAddEnterpriseModalOpen, setIsAddEnterpriseModalOpen] = useState(false);
  const [refreshEnterprises, setRefreshEnterprises] = useState(false);

  const handleEnterpriseAdded = () => {
    setRefreshEnterprises(prev => !prev);
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
                  <Building className="text-primary me-2" size={28} />
                  <h2 className="h3 mb-0">Enterprise Management</h2>
                </div>
                <p className="text-muted">Manage enterprises, status, and permissions</p>
              </div>
              <button
                className="btn btn-primary d-flex align-items-center rounded-pill px-4 py-2 shadow-sm"
                onClick={() => setIsAddEnterpriseModalOpen(true)}
              >
                <Plus className="me-2" size={16} />
                Add New Enterprise
              </button>
            </div>

            {/* Enterprise Table */}
            <EnterpriseTable refreshEnterprises={refreshEnterprises} />
          </div>
        </div>
      </div>

      <AddEnterpriseModal
        isOpen={isAddEnterpriseModalOpen}
        onClose={() => setIsAddEnterpriseModalOpen(false)}
        onSuccess={handleEnterpriseAdded}
      />
    </div>
  );
}

export default AdminManageEnterprise;
