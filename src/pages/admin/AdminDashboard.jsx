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
        <div
          className="flex-grow-1 overflow-auto p-4"
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <h4>Dashboard Admin</h4>
          <p>
            {Array(1000)
              .fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
              .join(' ')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
