import { ChartColumnIncreasing } from 'lucide-react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';

function AdminDashboard() {
  return (
    <div className="vh-100 overflow-hidden d-flex flex-column">
      <Header />

      {/* Main layout: Sidebar + Content */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-white border-end" style={{ width: '16rem', height: 'calc(100vh - 64px)' }}>
          <Sidebar />
        </div>

        {/* Content */}
        <div className="flex-grow-1 overflow-auto p-4">
          <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <div className="d-flex align-items-center mb-2">
                  <ChartColumnIncreasing className="text-primary me-2" size={28} />
                  <h2 className="h3 mb-0">Dashboard</h2>
                </div>
                <p className="text-muted">View Dashboard</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
