import { useState, useMemo, useEffect } from "react"
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
    Pencil,
} from "lucide-react"
import { useAuth } from "../../../auth/AuthProvider"
import api from "../../../api/axiosInstance"

const PendingOrders = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [priorityFilter, setPriorityFilter] = useState("All")
    const [timeFilter, setTimeFilter] = useState("all")
    const [pendingOrders, setPendingOrders] = useState([]);
    const [filteredPendingOrders, setFilteredPendingOrders] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // console.log(user.warehouseId)
        const fetchAllExportOrder = async () => {
            try {
                const [pendingOrderRes, usersRes, warehousesRes, locationsRes] = await Promise.all([
                    api.get(`http://localhost:9999/orders?_embed=orderDetails&sendWarehouseId=${user.warehouseId}&status=pending`),
                    api.get('http://localhost:9999/users'),
                    api.get('http://localhost:9999/warehouses'),
                    api.get('http://localhost:9999/locations'),
                ])

                const users = usersRes.data;
                const warehouses = warehousesRes.data;
                const locations = locationsRes.data;
                // console.log("", exportOrderRes.data)
                let pendingOrder = pendingOrderRes.data.map((order) => {
                    let sendWarehouse = warehouses.find(w => w.id === order.receiveWarehouseId);
                    let buyer = users.find(u => u.id === order.buyerId);
                    let destinationInfo = order.buyerId !== null ?
                        { customer: buyer.username, destination: locations.find(l => l.userId === buyer.id).location }
                        : { customer: sendWarehouse.name, destination: sendWarehouse.location }
                    return {
                        ...order,
                        ...destinationInfo,
                        value: order.orderDetails.reduce((total, product) => total + product.price, 0),
                        items: order.orderDetails.length
                    }
                })
                // console.log("pending Order: ", pendingOrder)
                setPendingOrders(pendingOrder);
                setFilteredPendingOrders(pendingOrder);

            } catch (err) {
                console.log('error fetching order: ', err)
            }
        }

        fetchAllExportOrder();
    }, [])

    // filter by search and status
    useEffect(() => {
        // console.log("timeFilter: ", timeFilter)
        const filterOrder = () => {
            let filtered = pendingOrders.filter((order) => {
                const matchesSearch = searchTerm !== null ?
                    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.type.toLowerCase().includes(searchTerm.toLowerCase())
                    : true

                const matchesStatus = statusFilter === "All" || order.status === statusFilter
                let index = -1;
                switch (timeFilter) {
                    case "Today":
                        index = 2;
                        break;
                    case "month":
                        index = 1;
                        break;
                    case "year":
                        index = 0;
                        break;
                    default:
                        break;
                }
                // console.log("index: ", index)

                // console.log("date: ", order.date.split("-"))
                // console.log("date: ", new Date().toLocaleDateString((
                //     "en-CA"
                // )).split("-")[index])

                // if (index === -1) {
                const matchesTime = index === -1 ?
                    true
                    :
                    // } else {
                    [...Array(index + 1).keys()].every(i =>
                        order.date.split("-")[i] ===
                        new Date().toLocaleDateString((
                            "en-CA"
                        )).split("-")[i]
                    )

                // console.log("matchTime: ", matchesTime);
                return matchesSearch && matchesStatus && matchesTime;
            })

            // console.log("filtered: ", filtered);
            setFilteredPendingOrders(filtered)
        }

        filterOrder();

    }, [searchTerm, timeFilter, statusFilter])


    const ordersPerPage = 5

    const totalPages = Math.ceil(filteredPendingOrders.length / ordersPerPage)
    const startIndex = (currentPage - 1) * ordersPerPage
    const currentOrders = filteredPendingOrders.slice(startIndex, startIndex + ordersPerPage)

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
        switch (status.toLowerCase()) {
            case "ready":
                return "success"
            // case "pending":
            //     return "primary"
            case "pending":
                return "warning"
            case "shipped":
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

    const uniqueStatuses = ["All", ...Array.from(new Set(pendingOrders.map((order) => order.status)))]
    const time = ["All", "This Year", "This Month", "Today"]

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
                            <h3 className="mb-0">{filteredPendingOrders.length}</h3>
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
                                    <h6 className="text-danger mb-1">Total Pending</h6>
                                    <h4 className="mb-0">{filteredPendingOrders.length}</h4>
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
                                    <h4 className="mb-0">{filteredPendingOrders.filter((o) => o.status === "ready").length}</h4>
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
                                    <h4 className="mb-0">${pendingOrders.reduce((sum, o) => sum + o.value, 0).toLocaleString()}</h4>
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
                                    <h4 className="mb-0">{pendingOrders.reduce((sum, o) => sum + o.items, 0)}</h4>
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
                        {/* <Col lg={3} className="mb-3">
                            <Form.Label>Filter by Status</Form.Label>
                            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                {uniqueStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col> */}
                        <Col lg={3} className="mb-3">
                            <Form.Label>Filter by Time</Form.Label>
                            <Form.Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                                {time.map((timeType) => (
                                    <option key={timeType} value={timeType}>
                                        {timeType}
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
                                    {/* <th>Priority</th> */}
                                    <th>Status & Progress</th>
                                    <th>Created Date</th>
                                    <th>Expected Ship Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    pendingOrders.length !== 0 ?
                                        currentOrders.length !== 0 ?
                                            currentOrders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>
                                                        <div>
                                                            <strong className="text-primary">{order.id}</strong>
                                                            <br />
                                                            <small className="text-muted">{order.items} item(s)</small>
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
                                                    {/* <td>
                                            <Badge bg={getPriorityVariant(order.priority)} className="px-3 py-2">
                                                {order.priority}
                                            </Badge>
                                        </td> */}
                                                    <td>
                                                        <div className="d-flex justify-center">
                                                            <Badge bg={getStatusVariant(order.status)} className="mb-2 px-4 py-2">
                                                                {order.status}
                                                            </Badge>
                                                            {/* <ProgressBar
                                                    variant={getProgressVariant(order.progress)}
                                                    now={order.progress}
                                                    style={{ height: "6px" }}
                                                />
                                                <small className="text-muted">{order.progress}% Complete</small> */}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <strong>{new Date(order.date).toLocaleDateString(("vi-VN"), {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit"
                                                        })}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {Math.ceil(
                                                                (new Date().getTime() - new Date(order.date).getTime()) / (1000 * 60 * 60 * 24),
                                                            )}{" "}
                                                            days ago
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <strong>{new Date(order.expectedDeliveryDate).toLocaleDateString(("vi-VN"), {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit"
                                                        })}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {Math.ceil(
                                                                (new Date(order.expectedDeliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                                                            )}{" "}
                                                            days remaining
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <ButtonGroup size="sm">
                                                            <Button variant="outline-primary" title="View Details">
                                                                <Eye size={14} />
                                                            </Button>
                                                            <Button variant="outline-danger" title="Update Order">
                                                                <Pencil size={14} />
                                                            </Button>
                                                        </ButtonGroup>
                                                    </td>
                                                </tr>
                                            ))
                                            : <tr>
                                                <td colSpan={10}>
                                                    <Alert variant="warning">There is no such Order</Alert>
                                                </td>
                                            </tr>
                                        : <tr>
                                            <td colSpan={10}>
                                                <Alert variant="danger">
                                                    There are no exported order that you handle yet
                                                </Alert>
                                            </td>
                                        </tr>
                                }
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Card.Footer className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Showing {startIndex + 1} to {Math.min(startIndex + ordersPerPage, filteredPendingOrders.length)} of{" "}
                                {filteredPendingOrders.length} orders
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

export default PendingOrders;

