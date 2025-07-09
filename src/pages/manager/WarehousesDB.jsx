import { useState, useEffect } from 'react';
import { Row, Col, InputGroup, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import ManagerSidebar from '../../components/manager/ManagerSidebar';
import WarehouseCard from '../../components/manager/WarehouseCard';
import WarehouseModal from '../../components/manager/WarehouseModal';

function WarehousesDB() {
  const [warehouses, setWarehouses] = useState([]);
  const [enterprise, setEnterprise] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = ['manager', 'admin'].includes(currentUser.role);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { enterpriseId } = currentUser;
    if (!enterpriseId) {
      setError('Bạn chưa được phân công vào doanh nghiệp nào');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [enterpriseRes, warehouseRes, inventoryRes, usersRes] = await Promise.all([
        axios.get(`http://localhost:9999/enterprises/${enterpriseId}`),
        axios.get(`http://localhost:9999/warehouses?enterpriseId=${enterpriseId}`),
        axios.get('http://localhost:9999/inventory'), 
        axios.get('http://localhost:9999/users')
      ]);
      
      const inventory = inventoryRes.data; 
      const users = usersRes.data;

      const mergedWarehouses = warehouseRes.data.map(w => {
        const warehouseInventory = inventory.filter(i => i.warehouseId === w.id);
        
        return {
          ...w,
          productCount: new Set(warehouseInventory.map(item => item.productId)).size,
          totalQuantity: warehouseInventory.reduce((sum, i) => sum + i.quantity, 0),
          staffCount: users.filter(u => u.warehouseId === w.id && u.role === 'staff').length,
        };
      });

      setEnterprise(enterpriseRes.data);
      setWarehouses(mergedWarehouses);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Can not fetch warehouses data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this warehouse?')) return;

    try {
      await axios.delete(`http://localhost:9999/warehouses/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError('Can not delete warehouse');
    }
  };

  const handleSubmit = async (data) => {
    const payload = { ...data, enterpriseId: currentUser.enterpriseId };

    try {
      if (editingWarehouse) {
        await axios.put(`http://localhost:9999/warehouses/${editingWarehouse.id}`, payload);
      } else {
        await axios.post(`http://localhost:9999/warehouses`, payload);
      }

      await fetchData();
      setShowModal(false);
      setEditingWarehouse(null);
    } catch (err) {
      console.error(err);
      setError('Can not save warehouse data');
    }
  };

  const openModal = (warehouse = null) => {
    setEditingWarehouse(warehouse);
    setShowModal(true);
  };

  const handleView = (warehouse) => {
    console.log('Viewing warehouse:', warehouse);
  };

  const filteredWarehouses = warehouses.filter(w =>
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <ManagerSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {isSidebarCollapsed && (
        <button onClick={() => setIsSidebarCollapsed(false)} className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', bottom: '20px', left: '20px', width: '50px', height: '50px', borderRadius: '50%', background: '#007bff', border: 'none', color: 'white', fontSize: '18px', boxShadow: '0 4px 12px rgba(0,123,255,0.4)', zIndex: 2000 }}>
          <i className="fas fa-bars"></i>
        </button>
      )}

      <div style={{ marginLeft: isSidebarCollapsed ? '0px' : '260px', transition: 'margin-left 0.3s ease-in-out' }}>
        <div className="p-4 bg-white border-bottom">
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="btn btn-link p-0 me-3 text-muted"><i className={`fas ${isSidebarCollapsed ? 'fa-bars' : 'fa-times'}`}></i></button>
                <i className="fas fa-home text-muted me-2" />
                <span className="text-muted me-2">Manager</span>
                <i className="fas fa-chevron-right text-muted me-2" style={{ fontSize: '12px' }} />
                <span className="text-muted">Warehouses</span>
              </div>
              <h4 className="mb-0 mt-2">Warehouse Management ({filteredWarehouses.length})</h4>
              {enterprise && <p className="text-muted mb-0">Enterprise: {enterprise.name}</p>}
            </Col>

            <Col xs="auto">
              <div className="d-flex align-items-center gap-3">
                <InputGroup style={{ width: '300px' }}>
                  <InputGroup.Text className="bg-white"><i className="fas fa-search text-muted" /></InputGroup.Text>
                  <Form.Control type="text" placeholder="Tìm kiếm theo tên, địa chỉ" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </InputGroup>
                {isOwner && (<Button variant="primary" onClick={() => openModal()}><i className="fas fa-plus me-2" />Add Warehouse</Button>)}
              </div>
            </Col>
          </Row>
        </div>

        <div className="p-4">
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {!enterprise ? (
            <div className="text-center py-5">
              <i className="fas fa-building text-muted mb-3" style={{ fontSize: '48px' }} />
              <h5>No enterprise</h5>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-warehouse text-muted mb-3" style={{ fontSize: '48px' }} />
              <h5>No warehouse</h5>
              <p className="text-muted">{searchTerm ? 'Không có kho phù hợp với tìm kiếm.' : isOwner ? 'Hãy tạo kho đầu tiên cho doanh nghiệp.' : 'Chưa có kho nào được tạo.'}</p>
              {isOwner && !searchTerm && (<Button variant="primary" onClick={() => openModal()}><i className="fas fa-plus me-2" />Create Warehouse</Button>)}
            </div>
          ) : (
            <Row className="g-4">
              {filteredWarehouses.map(wh => (
                <Col key={wh.id} lg={4} md={6} sm={12}>
                  <WarehouseCard warehouse={wh} onEdit={openModal} onDelete={handleDelete} onView={handleView} isOwner={isOwner} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      <WarehouseModal show={showModal} onClose={() => setShowModal(false)} warehouse={editingWarehouse} enterpriseName={enterprise?.name} onSubmit={handleSubmit} />
    </div>
  );
}

export default WarehousesDB;