import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import { useAuth } from '../../auth/AuthProvider';

function ManagerDashboard() {
    const { user, loading: authLoading } = useAuth();
    console.log(user);
    
    const [dashboardData, setDashboardData] = useState({
        enterprise: null,
        warehouses: [],
        products: []
    });
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setDashboardLoading(true);
        setError(null);

        try {
            if (!user || !user.enterpriseId) {
                throw new Error("Dữ liệu người dùng không đầy đủ hoặc thiếu ID Doanh nghiệp.");
            }
            console.log('user:', user);
            
            const enterpriseId = user.enterpriseId;
            console.log('enterpriseId:', enterpriseId);
            
            const [enterpriseRes, warehousesRes, productsRes] = await Promise.all([
                api.get(`/enterprises/${enterpriseId}`),
                api.get(`/warehouses?enterpriseId=${enterpriseId}`),
                api.get('/products')
            ]);

            const enterpriseData = enterpriseRes.data;
            const warehousesData = warehousesRes.data;
            const allProducts = productsRes.data;

            const enterpriseProducts = allProducts.filter(product => {
                const warehouseIds = warehousesData.map(w => parseInt(w.id));
                return warehouseIds.includes(parseInt(product.warehouseId));
            });

            setDashboardData({
                enterprise: enterpriseData,
                warehouses: warehousesData,
                products: enterpriseProducts 
            });

        } catch (err) {
            console.error('Lỗi khi tải dữ liệu dashboard:', err);
            setError(err.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setDashboardLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            fetchData();
        } else {
            setDashboardLoading(false);
        }
    }, [authLoading, user, fetchData]);

    if (authLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Alert variant="warning">
                    You are not logged in. Please <a href="/auth/login">login</a> to continue.
                </Alert>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>Failed to Load Dashboard</Alert.Heading>
                    <p>{error}</p>
                    <hr />
                    <Button variant="outline-danger" onClick={fetchData} disabled={dashboardLoading}>
                        {dashboardLoading ? 'Retrying...' : 'Try Again'}
                    </Button>
                </Alert>
            </div>
        );
    }

    if (dashboardLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="info" />
            </div>
        );
    }
    console.log('dashboardData:', dashboardData);

    return (
        <>
            <header className="p-4 bg-white border-bottom">
                <Row className="align-items-center">
                    <Col>
                        <h4 className="mb-0 mt-1">Manager Dashboard</h4>
                        <p className="text-muted mb-0">Welcome, {user?.fullName || 'Manager'}</p>
                    </Col>
                </Row>
            </header>

            <div className="p-4">
                <Row className="mb-4">
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="text-center">
                                <i className="fas fa-industry fa-2x text-primary mb-2"></i>
                                <h5>{dashboardData.enterprise?.name || 'N/A'}</h5>
                                <p className="text-muted mb-0">Enterprise</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="text-center">
                                <i className="fas fa-warehouse fa-2x text-warning mb-2"></i>
                                <h5>{dashboardData.warehouses?.length || 0}</h5>
                                <p className="text-muted mb-0">Warehouses</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="text-center">
                                <i className="fas fa-box fa-2x text-info mb-2"></i>
                                <h5>{dashboardData.products?.length || 0}</h5>
                                <p className="text-muted mb-0">Total Products</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default ManagerDashboard;