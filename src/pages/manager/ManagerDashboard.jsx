import { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import ManagerSidebar from '../../components/manager/ManagerSidebar';

function ManagerDashboard() {
    const [enterprise, setEnterprise] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const enterpriseId = currentUser.enterpriseId;

            const enterpriseRes = await axios.get(`http://localhost:9999/enterprises/${enterpriseId}`);
            const enterpriseData = enterpriseRes.data;
            setEnterprise(enterpriseData);

            const warehousesRes = await axios.get(`http://localhost:9999/warehouses?enterpriseId=${enterpriseId}`);
            setWarehouses(warehousesRes.data);

            const productsRes = await axios.get(`http://localhost:9999/products?enterpriseId=${enterpriseId}`);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Error fetching enterprise dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8f9fa' }} className="d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <ManagerSidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            {isSidebarCollapsed && (
                <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#007bff',
                        border: 'none',
                        color: 'white',
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(0,123,255,0.4)',
                        zIndex: 2000
                    }}
                >
                    <i className="fas fa-bars"></i>
                </button>
            )}

            <div
                style={{
                    marginLeft: isSidebarCollapsed ? '0px' : '260px',
                    transition: 'margin-left 0.3s ease-in-out'
                }}
                className="p-4"
            >
                <div style={{ background: 'white', borderRadius: '8px', marginBottom: '20px' }} className="p-4 shadow-sm">
                    <Row className="align-items-center">
                        <Col>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-home text-muted me-2"></i>
                                <span className="text-muted me-2">Manager</span>
                            </div>
                            <h4 className="mb-0 mt-1">Manager Dashboard</h4>
                            <p className="text-muted mb-0">Welcome, {currentUser.fullName || 'Manager'}</p>
                        </Col>
                        <Col xs="auto">
                            <Button variant="primary" onClick={fetchData}>
                                <i className="fas fa-sync-alt me-2"></i>Refresh
                            </Button>
                        </Col>
                    </Row>
                </div>

                <Row className="mb-4">
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="text-center">
                                <div className="text-primary mb-2">
                                    <i className="fas fa-industry fa-2x"></i>
                                </div>
                                <h5>{enterprise.name}</h5>
                                <p className="text-muted mb-0">Enterprise</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="text-center">
                                <div className="text-warning mb-2">
                                    <i className="fas fa-warehouse fa-2x"></i>
                                </div>
                                <h5>{warehouses.length}</h5>
                                <p className="text-muted mb-0">Warehouses</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="text-center">
                                <div className="text-info mb-2">
                                    <i className="fas fa-box fa-2x"></i>
                                </div>
                                <h5>{products.length}</h5>
                                <p className="text-muted mb-0">Products</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default ManagerDashboard;
