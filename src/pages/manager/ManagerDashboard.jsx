import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import ManagerSidebar from '../../components/manager/ManagerSidebar';
import { useAuth } from '../../auth/AuthProvider';

function ManagerDashboard() {
    const { user, loading: authLoading } = useAuth();
    
    const [dashboardData, setDashboardData] = useState({
        enterprise: null,
        warehouses: [],
        products: []
    });
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // === SỬA LOGIC FETCH DỮ LIỆU Ở ĐÂY ===
    const fetchData = useCallback(async () => {
        setDashboardLoading(true);
        setError(null);

        try {
            if (!user || !user.enterpriseId) {
                throw new Error("User data is incomplete or missing Enterprise ID.");
            }
            
            const enterpriseId = user.enterpriseId;
            
            // --- Bước 1 & 2: Lấy Enterprise và Warehouses ---
            // Gọi song song 2 API này trước.
            const [enterpriseRes, warehousesRes] = await Promise.all([
                api.get(`/enterprises/${enterpriseId}`),
                api.get(`/warehouses?enterpriseId=${enterpriseId}`)
            ]);

            const enterpriseData = enterpriseRes.data;
            const warehousesData = warehousesRes.data;

            let allProducts = [];
            // --- Bước 3: Dựa vào warehouses để lấy products ---
            if (warehousesData && warehousesData.length > 0) {
                // Tạo một mảng các promise, mỗi promise là một lệnh gọi API để lấy product cho một warehouse
                const productPromises = warehousesData.map(warehouse =>
                    api.get(`/products?warehouseId=${warehouse.id}`)
                );
                
                // Thực thi tất cả các promise này song song
                const productResults = await Promise.all(productPromises);
                
                // Gộp tất cả các mảng product từ các kết quả lại thành một mảng duy nhất
                allProducts = productResults.flatMap(response => response.data);
            }

            // --- Bước 4: Cập nhật state ---
            setDashboardData({
                enterprise: enterpriseData,
                warehouses: warehousesData,
                products: allProducts
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setDashboardLoading(false);
        }
    }, [user]);

    // useEffect và phần render JSX không cần thay đổi
    useEffect(() => {
        if (authLoading) return;
        if (user) {
            fetchData();
        } else {
            setDashboardLoading(false);
        }
    }, [authLoading, user, fetchData]);

    // ... Toàn bộ phần render JSX từ `if (authLoading)` trở xuống giữ nguyên y hệt ...
    // ... không cần copy lại vì nó đã đúng ...
    
    // Ưu tiên 1: Loading của AuthProvider
    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh' }} className="d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }
    
    // Ưu tiên 2: User không tồn tại
    if (!user) {
        return (
            <div style={{ minHeight: '100vh' }} className="d-flex align-items-center justify-content-center">
                <Alert variant="warning">
                    You are not logged in. Please <a href="/login">login</a> to continue.
                </Alert>
            </div>
        );
    }
    
    // Ưu tiên 3: Hiển thị lỗi nếu có
    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8f9fa' }} className="d-flex align-items-center justify-content-center">
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

    // Ưu tiên 4: Loading của Dashboard
    if (dashboardLoading) {
        return (
            <div style={{ minHeight: '100vh' }} className="d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="info" />
            </div>
        );
    }
    
    // Cuối cùng: Hiển thị giao diện dashboard
    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <ManagerSidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />
            <main
                style={{
                    marginLeft: isSidebarCollapsed ? '0px' : '260px',
                    transition: 'margin-left 0.3s ease-in-out'
                }}
                className="p-4"
            >
                <div style={{ background: 'white', borderRadius: '8px', marginBottom: '20px' }} className="p-4 shadow-sm">
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="mb-0 mt-1">Manager Dashboard</h4>
                            <p className="text-muted mb-0">Welcome, {user?.fullName || 'Manager'}</p>
                        </Col>
                        <Col xs="auto">
                            <Button variant="primary" onClick={fetchData} disabled={dashboardLoading}>
                                <i className={`fas fa-sync-alt me-2 ${dashboardLoading ? 'fa-spin' : ''}`}></i>Refresh
                            </Button>
                        </Col>
                    </Row>
                </div>

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
            </main>
        </div>
    );
}

export default ManagerDashboard;