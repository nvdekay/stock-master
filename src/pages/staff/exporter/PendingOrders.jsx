import { useState, useMemo } from "react"
import {
    Container,
    Row,
    Col,
    Navbar,
    Nav,
    Card,
    Table,
    Pagination,
    Badge,
    Button,
    Form,
    InputGroup,
    Alert,
    ProgressBar,
    ButtonGroup,
    Offcanvas,
} from "react-bootstrap"
import {
    Search,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Download,
    Filter,
    Menu,
    Bell,
    Settings,
    FileText,
    TrendingUp,
    Users,
    Globe,
} from "lucide-react"

// Mock data for demonstration
const mockPendingOrders = [
    {
        id: "EXP-2024-001",
        customer: "Global Trade Corp",
        destination: "Hamburg, Germany",
        items: 45,
        value: 125000,
        priority: "High",
        orderDate: "2024-01-15",
        expectedShipDate: "2024-01-20",
        status: "Processing",
        progress: 65,
    },
    {
        id: "EXP-2024-002",
        customer: "International Logistics Ltd",
        destination: "Rotterdam, Netherlands",
        items: 32,
        value: 89000,
        priority: "Medium",
        orderDate: "2024-01-16",
        expectedShipDate: "2024-01-22",
        status: "Pending Documentation",
        progress: 30,
    },
    {
        id: "EXP-2024-003",
        customer: "Pacific Imports Inc",
        destination: "Los Angeles, USA",
        items: 67,
        value: 198000,
        priority: "High",
        orderDate: "2024-01-17",
        expectedShipDate: "2024-01-25",
        status: "Ready to Ship",
        progress: 95,
    },
    {
        id: "EXP-2024-004",
        customer: "Euro Distribution SA",
        destination: "Barcelona, Spain",
        items: 28,
        value: 76000,
        priority: "Low",
        orderDate: "2024-01-18",
        expectedShipDate: "2024-01-28",
        status: "Processing",
        progress: 45,
    },
    {
        id: "EXP-2024-005",
        customer: "Nordic Trade AS",
        destination: "Oslo, Norway",
        items: 41,
        value: 112000,
        priority: "Medium",
        orderDate: "2024-01-19",
        expectedShipDate: "2024-01-26",
        status: "Customs Clearance",
        progress: 75,
    },
    {
        id: "EXP-2024-006",
        customer: "Asian Markets Ltd",
        destination: "Singapore",
        items: 53,
        value: 145000,
        priority: "High",
        orderDate: "2024-01-20",
        expectedShipDate: "2024-01-27",
        status: "Processing",
        progress: 55,
    },
    {
        id: "EXP-2024-007",
        customer: "Mediterranean Traders",
        destination: "Marseille, France",
        items: 39,
        value: 95000,
        priority: "Medium",
        orderDate: "2024-01-21",
        expectedShipDate: "2024-01-29",
        status: "Ready to Ship",
        progress: 90,
    },
]

const mockExportHistory = [
    {
        id: "EXP-2023-156",
        customer: "Global Shipping Co",
        destination: "Tokyo, Japan",
        items: 72,
        value: 234000,
        shipDate: "2023-12-15",
        deliveryDate: "2023-12-28",
        status: "Delivered",
        trackingNumber: "TRK-789456123",
        rating: 5,
    },
    {
        id: "EXP-2023-155",
        customer: "Atlantic Trade Partners",
        destination: "New York, USA",
        items: 48,
        value: 156000,
        shipDate: "2023-12-10",
        deliveryDate: "2023-12-18",
        status: "Delivered",
        trackingNumber: "TRK-654321987",
        rating: 4,
    },
    {
        id: "EXP-2023-154",
        customer: "European Logistics Hub",
        destination: "Berlin, Germany",
        items: 61,
        value: 189000,
        shipDate: "2023-12-08",
        deliveryDate: "2023-12-15",
        status: "Delivered",
        trackingNumber: "TRK-321654789",
        rating: 5,
    },
    {
        id: "EXP-2023-153",
        customer: "South American Imports",
        destination: "São Paulo, Brazil",
        items: 35,
        value: 98000,
        shipDate: "2023-12-05",
        deliveryDate: "2023-12-20",
        status: "In Transit",
        trackingNumber: "TRK-987123456",
        rating: null,
    },
    {
        id: "EXP-2023-152",
        customer: "Middle East Trading",
        destination: "Dubai, UAE",
        items: 44,
        value: 127000,
        shipDate: "2023-12-01",
        deliveryDate: "2023-12-08",
        status: "Delivered",
        trackingNumber: "TRK-456789123",
        rating: 4,
    },
]

const PendingOrders = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [priorityFilter, setPriorityFilter] = useState("All")
    const ordersPerPage = 5

    const filteredOrders = useMemo(() => {
        return mockPendingOrders.filter((order) => {
            const matchesSearch =
                order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.destination.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === "All" || order.status === statusFilter
            const matchesPriority = priorityFilter === "All" || order.priority === priorityFilter
            return matchesSearch && matchesStatus && matchesPriority
        })
    }, [searchTerm, statusFilter, priorityFilter])

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
    const startIndex = (currentPage - 1) * ordersPerPage
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage)

    const getPriorityVariant = (priority) => {
        switch (priority) {
            case "High":
                return "danger"
            case "Medium":
                return "warning"
            case "Low":
                return "success"
            default:
                return "secondary"
        }
    }

    const getStatusVariant = (status) => {
        switch (status) {
            case "Ready to Ship":
                return "success"
            case "Processing":
                return "primary"
            case "Pending Documentation":
                return "warning"
            case "Customs Clearance":
                return "info"
            default:
                return "secondary"
        }
    }

    const getProgressVariant = (progress) => {
        if (progress >= 90) return "success"
        if (progress >= 70) return "info"
        if (progress >= 50) return "warning"
        return "danger"
    }

    const uniqueStatuses = ["All", ...Array.from(new Set(mockPendingOrders.map((order) => order.status)))]
    const uniquePriorities = ["All", "High", "Medium", "Low"]

    return (
        <div>
            {/* Header Section */}
            <div className="bg-primary text-white p-4 rounded mb-4">
                <Row className="align-items-center">
                    <Col>
                        <h2 className="mb-1 d-flex align-items-center">
                            <Clock className="me-2" size={28} />
                            Pending Export Orders
                        </h2>
                        <p className="mb-0 opacity-75">Manage and track your pending export orders</p>
                    </Col>
                    <Col xs="auto">
                        <div className="text-center">
                            <h3 className="mb-0">{filteredOrders.length}</h3>
                            <small>Total Orders</small>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Quick Stats */}
            <Row className="mb-4">
                <Col md={3} className="mb-3">
                    <Card className="border-start border-danger border-4 h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-danger mb-1">High Priority</h6>
                                    <h4 className="mb-0">{mockPendingOrders.filter((o) => o.priority === "High").length}</h4>
                                </div>
                                <div className="text-danger">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="border-start border-success border-4 h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-success mb-1">Ready to Ship</h6>
                                    <h4 className="mb-0">{mockPendingOrders.filter((o) => o.status === "Ready to Ship").length}</h4>
                                </div>
                                <div className="text-success">
                                    <Package size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="border-start border-info border-4 h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-info mb-1">Total Value</h6>
                                    <h4 className="mb-0">${mockPendingOrders.reduce((sum, o) => sum + o.value, 0).toLocaleString()}</h4>
                                </div>
                                <div className="text-info">
                                    <Globe size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="border-start border-warning border-4 h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-warning mb-1">Total Items</h6>
                                    <h4 className="mb-0">{mockPendingOrders.reduce((sum, o) => sum + o.items, 0)}</h4>
                                </div>
                                <div className="text-warning">
                                    <Users size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters and Search */}
            <Card className="mb-4">
                <Card.Header className="bg-light">
                    <h6 className="mb-0 d-flex align-items-center">
                        <Filter className="me-2" size={16} />
                        Search & Filter Options
                    </h6>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col lg={6} className="mb-3">
                            <Form.Label>Search Orders</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light">
                                    <Search size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by customer, order ID, or destination..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col lg={3} className="mb-3">
                            <Form.Label>Filter by Status</Form.Label>
                            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                {uniqueStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col lg={3} className="mb-3">
                            <Form.Label>Filter by Priority</Form.Label>
                            <Form.Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                                {uniquePriorities.map((priority) => (
                                    <option key={priority} value={priority}>
                                        {priority}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Orders Table */}
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Order Details</h6>
                    <ButtonGroup size="sm">
                        <Button variant="outline-primary">
                            <FileText size={14} className="me-1" />
                            Export
                        </Button>
                        <Button variant="outline-secondary">
                            <Settings size={14} className="me-1" />
                            Settings
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>Order Details</th>
                                    <th>Customer & Destination</th>
                                    <th>Order Value</th>
                                    <th>Priority</th>
                                    <th>Status & Progress</th>
                                    <th>Expected Ship Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <div>
                                                <strong className="text-primary">{order.id}</strong>
                                                <br />
                                                <small className="text-muted">{order.items} items</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{order.customer}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    <Globe size={12} className="me-1" />
                                                    {order.destination}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <strong className="text-success">${order.value.toLocaleString()}</strong>
                                        </td>
                                        <td>
                                            <Badge bg={getPriorityVariant(order.priority)} className="px-3 py-2">
                                                {order.priority}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div>
                                                <Badge bg={getStatusVariant(order.status)} className="mb-2">
                                                    {order.status}
                                                </Badge>
                                                <ProgressBar
                                                    variant={getProgressVariant(order.progress)}
                                                    now={order.progress}
                                                    style={{ height: "6px" }}
                                                />
                                                <small className="text-muted">{order.progress}% Complete</small>
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{new Date(order.expectedShipDate).toLocaleDateString()}</strong>
                                            <br />
                                            <small className="text-muted">
                                                {Math.ceil(
                                                    (new Date(order.expectedShipDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                                                )}{" "}
                                                days
                                            </small>
                                        </td>
                                        <td>
                                            <ButtonGroup size="sm">
                                                <Button variant="outline-primary" title="View Details">
                                                    <Eye size={14} />
                                                </Button>
                                                <Button variant="outline-success" title="Download">
                                                    <Download size={14} />
                                                </Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Card.Footer className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Showing {startIndex + 1} to {Math.min(startIndex + ordersPerPage, filteredOrders.length)} of{" "}
                                {filteredOrders.length} orders
                            </small>
                            <Pagination className="mb-0">
                                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                <Pagination.Prev
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                />
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                                    return (
                                        <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                                            {page}
                                        </Pagination.Item>
                                    )
                                })}
                                <Pagination.Next
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                />
                                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    </Card.Footer>
                )}
            </Card>
        </div>
    )
}

const ExportHistory = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")

    const filteredHistory = useMemo(() => {
        return mockExportHistory.filter((order) => {
            const matchesSearch =
                order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === "All" || order.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [searchTerm, statusFilter])

    const getStatusVariant = (status) => {
        switch (status) {
            case "Delivered":
                return "success"
            case "In Transit":
                return "primary"
            case "Delayed":
                return "warning"
            case "Cancelled":
                return "danger"
            default:
                return "secondary"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "Delivered":
                return <CheckCircle size={16} />
            case "In Transit":
                return <Clock size={16} />
            case "Cancelled":
                return <XCircle size={16} />
            default:
                return <Package size={16} />
        }
    }

    const renderStars = (rating) => {
        if (!rating) return <span className="text-muted">Not rated</span>
        return (
            <div>
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < rating ? "text-warning" : "text-muted"}>
                        ★
                    </span>
                ))}
            </div>
        )
    }

    const uniqueStatuses = ["All", ...Array.from(new Set(mockExportHistory.map((order) => order.status)))]
    const totalValue = filteredHistory.reduce((sum, order) => sum + order.value, 0)
    const totalItems = filteredHistory.reduce((sum, order) => sum + order.items, 0)
    const deliveredOrders = filteredHistory.filter((o) => o.status === "Delivered").length
    const avgRating =
        filteredHistory.filter((o) => o.rating).reduce((sum, o) => sum + (o.rating || 0), 0) /
        filteredHistory.filter((o) => o.rating).length

    return (
        <div>
            {/* Header Section */}
            <div className="bg-success text-white p-4 rounded mb-4">
                <Row className="align-items-center">
                    <Col>
                        <h2 className="mb-1 d-flex align-items-center">
                            <CheckCircle className="me-2" size={28} />
                            Export History & Analytics
                        </h2>
                        <p className="mb-0 opacity-75">Track completed exports and performance metrics</p>
                    </Col>
                    <Col xs="auto">
                        <div className="text-center">
                            <h3 className="mb-0">{filteredHistory.length}</h3>
                            <small>Completed Orders</small>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Analytics Dashboard */}
            <Row className="mb-4">
                <Col xl={3} md={6} className="mb-3">
                    <Card className="bg-gradient text-white" style={{ background: "linear-gradient(45deg, #28a745, #20c997)" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Total Revenue</h6>
                                    <h4 className="mb-0">${totalValue.toLocaleString()}</h4>
                                </div>
                                <TrendingUp size={32} className="opacity-75" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={3} md={6} className="mb-3">
                    <Card className="bg-gradient text-white" style={{ background: "linear-gradient(45deg, #007bff, #6610f2)" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Items Shipped</h6>
                                    <h4 className="mb-0">{totalItems.toLocaleString()}</h4>
                                </div>
                                <Package size={32} className="opacity-75" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={3} md={6} className="mb-3">
                    <Card className="bg-gradient text-white" style={{ background: "linear-gradient(45deg, #fd7e14, #e83e8c)" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Delivered Orders</h6>
                                    <h4 className="mb-0">{deliveredOrders}</h4>
                                </div>
                                <CheckCircle size={32} className="opacity-75" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={3} md={6} className="mb-3">
                    <Card className="bg-gradient text-white" style={{ background: "linear-gradient(45deg, #ffc107, #fd7e14)" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Avg Rating</h6>
                                    <h4 className="mb-0">{avgRating.toFixed(1)} ★</h4>
                                </div>
                                <Users size={32} className="opacity-75" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Performance Alert */}
            <Alert variant="info" className="mb-4">
                <Alert.Heading className="h6 mb-2">
                    <Bell className="me-2" size={16} />
                    Performance Summary
                </Alert.Heading>
                <p className="mb-0">
                    You have successfully delivered <strong>{deliveredOrders}</strong> orders with an average rating of{" "}
                    <strong>{avgRating.toFixed(1)} stars</strong>. Keep up the excellent work!
                </p>
            </Alert>

            {/* Search and Filters */}
            <Card className="mb-4">
                <Card.Header className="bg-light">
                    <h6 className="mb-0">Search & Filter History</h6>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col lg={8} className="mb-3">
                            <Form.Label>Search History</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light">
                                    <Search size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by customer, order ID, destination, or tracking number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col lg={4} className="mb-3">
                            <Form.Label>Filter by Status</Form.Label>
                            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                {uniqueStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* History Table */}
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Export History Details</h6>
                    <ButtonGroup size="sm">
                        <Button variant="outline-success">
                            <Download size={14} className="me-1" />
                            Export Report
                        </Button>
                        <Button variant="outline-primary">
                            <FileText size={14} className="me-1" />
                            Generate Invoice
                        </Button>
                    </ButtonGroup>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>Order Information</th>
                                    <th>Customer & Destination</th>
                                    <th>Financial Details</th>
                                    <th>Shipping Timeline</th>
                                    <th>Status & Rating</th>
                                    <th>Tracking</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <div>
                                                <strong className="text-primary">{order.id}</strong>
                                                <br />
                                                <small className="text-muted">{order.items} items shipped</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{order.customer}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    <Globe size={12} className="me-1" />
                                                    {order.destination}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <strong className="text-success">${order.value.toLocaleString()}</strong>
                                            <br />
                                            <small className="text-muted">${(order.value / order.items).toFixed(0)}/item</small>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>Shipped:</strong> {new Date(order.shipDate).toLocaleDateString()}
                                                <br />
                                                <strong>Delivered:</strong> {new Date(order.deliveryDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <Badge bg={getStatusVariant(order.status)} className="d-flex align-items-center gap-1 mb-2">
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </Badge>
                                                {renderStars(order.rating)}
                                            </div>
                                        </td>
                                        <td>
                                            <code className="small bg-light p-1 rounded">{order.trackingNumber}</code>
                                        </td>
                                        <td>
                                            <ButtonGroup size="sm">
                                                <Button variant="outline-primary" title="View Details">
                                                    <Eye size={14} />
                                                </Button>
                                                <Button variant="outline-success" title="Download Invoice">
                                                    <Download size={14} />
                                                </Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    )
}

export default function ExportOrderManagement() {
    const [activeTab, setActiveTab] = useState("pending")
    const [showSidebar, setShowSidebar] = useState(false)

    return (
        <div className="min-vh-100 bg-light">

            <Container fluid>
                <Row>
                    {/* Desktop Sidebar */}
                    <Col lg={3} xl={2} className="d-none d-lg-block p-0">
                        <div className="bg-white shadow-sm" style={{ minHeight: "calc(100vh - 56px)" }}>
                            <div className="p-3 border-bottom">
                                <h6 className="mb-0 text-muted">Exporter</h6>
                            </div>
                            <Nav className="flex-column">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === "pending"}
                                        onClick={() => setActiveTab("pending")}
                                        className={`d-flex align-items-center gap-2 py-3 px-3 ${activeTab === "pending" ? "bg-primary text-white" : "text-dark"}`}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <Clock size={18} />
                                        <div className="flex-grow-1">
                                            <div>Pending Orders</div>
                                            <small className={activeTab === "pending" ? "text-white-50" : "text-muted"}>
                                                {mockPendingOrders.length} orders waiting
                                            </small>
                                        </div>
                                        <Badge
                                            bg={activeTab === "pending" ? "light" : "warning"}
                                            text={activeTab === "pending" ? "dark" : "white"}
                                        >
                                            {mockPendingOrders.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === "history"}
                                        onClick={() => setActiveTab("history")}
                                        className={`d-flex align-items-center gap-2 py-3 px-3 ${activeTab === "history" ? "bg-primary text-white" : "text-dark"}`}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <CheckCircle size={18} />
                                        <div className="flex-grow-1">
                                            <div>Export History</div>
                                            <small className={activeTab === "history" ? "text-white-50" : "text-muted"}>
                                                {mockExportHistory.length} completed orders
                                            </small>
                                        </div>
                                        <Badge
                                            bg={activeTab === "history" ? "light" : "success"}
                                            text={activeTab === "history" ? "dark" : "white"}
                                        >
                                            {mockExportHistory.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                    </Col>

                    {/* Mobile Sidebar */}
                    <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="start">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Navigation</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="p-0">
                            <Nav className="flex-column">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === "pending"}
                                        onClick={() => {
                                            setActiveTab("pending")
                                            setShowSidebar(false)
                                        }}
                                        className={`d-flex align-items-center gap-2 py-3 px-3 ${activeTab === "pending" ? "bg-primary text-white" : "text-dark"}`}
                                    >
                                        <Clock size={18} />
                                        <div className="flex-grow-1">
                                            <div>Pending Orders</div>
                                            <small className={activeTab === "pending" ? "text-white-50" : "text-muted"}>
                                                {mockPendingOrders.length} orders waiting
                                            </small>
                                        </div>
                                        <Badge
                                            bg={activeTab === "pending" ? "light" : "warning"}
                                            text={activeTab === "pending" ? "dark" : "white"}
                                        >
                                            {mockPendingOrders.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === "history"}
                                        onClick={() => {
                                            setActiveTab("history")
                                            setShowSidebar(false)
                                        }}
                                        className={`d-flex align-items-center gap-2 py-3 px-3 ${activeTab === "history" ? "bg-primary text-white" : "text-dark"}`}
                                    >
                                        <CheckCircle size={18} />
                                        <div className="flex-grow-1">
                                            <div>Export History</div>
                                            <small className={activeTab === "history" ? "text-white-50" : "text-muted"}>
                                                {mockExportHistory.length} completed orders
                                            </small>
                                        </div>
                                        <Badge
                                            bg={activeTab === "history" ? "light" : "success"}
                                            text={activeTab === "history" ? "dark" : "white"}
                                        >
                                            {mockExportHistory.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Offcanvas.Body>
                    </Offcanvas>

                    {/* Main Content */}
                    <Col lg={9} xl={10} className="py-4">
                        {activeTab === "pending" && <PendingOrders />}
                        {activeTab === "history" && <ExportHistory />}
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
