import { useState, useMemo, useEffect } from "react"
import {
    Row,
    Col,
    Card,
    Table,
    Badge,
    Button,
    Form,
    InputGroup,
    Alert,
    ButtonGroup
} from "react-bootstrap"
import {
    Search,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Download,
    Bell,
    FileText,
    TrendingUp,
    Users,
    Globe,
} from "lucide-react"
import api from "../../../api/axiosInstance"
import { useAuth } from "../../../auth/AuthProvider"
import AlertsPanel from "../../../components/staff/exporter/AlertsPanel"

// const exportHistory = [
//     {
//         id: "EXP-2023-156",
//         customer: "Global Shipping Co",
//         destination: "Tokyo, Japan",
//         items: 72,
//         value: 234000,
//         shipDate: "2023-12-15",
//         deliveryDate: "2023-12-28",
//         status: "Delivered",
//         trackingNumber: "TRK-789456123",
//         rating: 5,
//     },
//     {
//         id: "EXP-2023-155",
//         customer: "Atlantic Trade Partners",
//         destination: "New York, USA",
//         items: 48,
//         value: 156000,
//         shipDate: "2023-12-10",
//         deliveryDate: "2023-12-18",
//         status: "Delivered",
//         trackingNumber: "TRK-654321987",
//         rating: 4,
//     },
//     {
//         id: "EXP-2023-154",
//         customer: "European Logistics Hub",
//         destination: "Berlin, Germany",
//         items: 61,
//         value: 189000,
//         shipDate: "2023-12-08",
//         deliveryDate: "2023-12-15",
//         status: "Delivered",
//         trackingNumber: "TRK-321654789",
//         rating: 5,
//     },
//     {
//         id: "EXP-2023-153",
//         customer: "South American Imports",
//         destination: "São Paulo, Brazil",
//         items: 35,
//         value: 98000,
//         shipDate: "2023-12-05",
//         deliveryDate: "2023-12-20",
//         status: "In Transit",
//         trackingNumber: "TRK-987123456",
//         rating: null,
//     },
//     {
//         id: "EXP-2023-152",
//         customer: "Middle East Trading",
//         destination: "Dubai, UAE",
//         items: 44,
//         value: 127000,
//         shipDate: "2023-12-01",
//         deliveryDate: "2023-12-08",
//         status: "Delivered",
//         trackingNumber: "TRK-456789123",
//         rating: 4,
//     },
// ]

const ExportHistory = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [timeFilter, setTimeFilter] = useState("all")
    const [exportHistory, setExportHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    // const [exp   ]
    const { user } = useAuth();

    useEffect(() => {
        // console.log(user.warehouseId)
        const fetchAllExportOrder = async () => {
            try {
                const exportOrderRes = await api.get(`http://localhost:9999/orders?_embed=orderDetails&sendWarehouseId=${user.warehouseId}`);
                // const order
                console.log("exportOrderRes: ", exportOrderRes.data)
                let exportOrder = exportOrderRes.data.map((order) => {
                    order.value = order.orderDetails.reduce((total, product) => total + product.price, 0);
                    order.items = order.orderDetails.length;
                    // console.log( order.orderDetails.reduce((total, product) => total + product.price, 0));
                    return order;
                })
                console.log("exportHistory: ", exportOrder)
                setExportHistory(exportOrder);
                setFilteredHistory(exportOrder);

            } catch (err) {
                console.log('error fetching order: ', err)
            }
        }

        fetchAllExportOrder();
    }, [])

    useEffect(() => {
        console.log("timeFilter: ", timeFilter)
        const filterOrder = () => {
            let filtered = exportHistory.filter((order) => {
                const matchesSearch = searchTerm.length !== 0 ?
                    // order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.id.toLowerCase().includes(searchTerm.toLowerCase())
                    : true
                // ||
                // order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                // order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())

                const matchesStatus = statusFilter === "All" || order.status === statusFilter
                let index = -1;
                switch (timeFilter) {
                    case "day":
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
                console.log("index: ", index)

                console.log("date: ", order.date.split("-"))
                console.log("date: ", new Date().toLocaleDateString((
                    "en-CA"
                )).split("-")[index])

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

                console.log("matchTime: ", matchesTime);
                return matchesSearch && matchesStatus && matchesTime;
            })

            console.log("filtered: ", filtered);
            setFilteredHistory(filtered)
        }

        filterOrder();

    }, [searchTerm, timeFilter, statusFilter])

    const getStatusVariant = (status) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "success"
            case "in_transit":
                return "primary"
            case "Cancelled":
                return "danger"
            case "shipped":
                return "warning"
            default:
                return "secondary"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle size={16} />
            case "in_transit":
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

    const uniqueStatuses = ["All", ...Array.from(new Set(exportHistory?.map((order) => order.status)))]
    // console.log('unique status: ', uniqueStatuses)
    const totalValue = filteredHistory.reduce((sum, order) => sum + order.value, 0)
    const totalItems = filteredHistory.reduce((sum, order) => sum + order.orderDetails.length, 0)
    const deliveredOrders = filteredHistory.filter((o) => ["completed", "shipped", "in_transit"].some((s) => o.status.includes(s))).length
    const returnedOrders = filteredHistory.filter((o) => o.status === "returned").length
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
            <Row className="mb-4 d-flex justify-between">
                <Col lg={8} className="mb-3">
                    <h1>TOTAL STATISTIC</h1>
                </Col>
                <Col lg={4} className="mb-3">
                    <Form.Label>Filter by Time</Form.Label>
                    <Form.Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                        <option key={"all"} value={"all"} selected={timeFilter.includes("all")}>All</option>
                        <option key={"year"} value={"year"} selected={timeFilter.includes("year")}>This Year</option>
                        <option key={"month"} value={"month"} selected={timeFilter.includes("month")}>This Month</option>
                        <option key={"day"} value={"day"} selected={timeFilter.includes("day")}>Today</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col xl={3} md={6} className="mb-3">
                    <Card className="text-white" style={{ background: "linear-gradient(45deg, #007bff, #6610f2)" }}>
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
                    <Card className="text-white" style={{ background: "linear-gradient(45deg, #fd7e14, #ffc107)" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Items Exported</h6>
                                    <h4 className="mb-0">{totalItems.toLocaleString()}</h4>
                                </div>
                                <Package size={32} className="opacity-75" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={3} md={6} className="mb-3">
                    <Card className="text-white" style={{ background: "linear-gradient(45deg, #28a745, #20c997)" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Exported Orders</h6>
                                    <h4 className="mb-0">{deliveredOrders}</h4>
                                </div>
                                <CheckCircle size={32} className="opacity-75" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={3} md={6} className="mb-3">
                    <Card className="text-white" style={{ background: "linear-gradient(45deg, #fd7e14, #e83e8c)" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Returned Order</h6>
                                    <h4 className="mb-0">{returnedOrders}</h4>
                                </div>
                                <Users size={32} className="opacity-75" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>

            {/* Performance Alert */}
            {deliveredOrders === 0 ?
                <Alert variant="danger" className="mb-4">
                    <Alert.Heading className="h6 mb-2">
                        <Bell className="me-2" size={16} />
                        Performance Summary
                    </Alert.Heading>
                    <p className="mb-0">
                        You have <strong>NOT</strong> delivered any order yet. Please start working <strong>NOW</strong>!
                    </p>
                </Alert>



                : <Alert variant="info" className="mb-4">
                    <Alert.Heading className="h6 mb-2">
                        <Bell className="me-2" size={16} />
                        Performance Summary
                    </Alert.Heading>
                    <p className="mb-0">
                        You have successfully delivered <strong>{deliveredOrders}</strong> order(s)
                        . Keep up the excellent work!
                    </p>
                </Alert>
            }

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
                                {
                                    exportHistory.length !== 0 ?
                                        filteredHistory.length !== 0 ?
                                            filteredHistory.map((order) => (
                                                <tr key={order.id}>
                                                    <td>
                                                        <div>
                                                            <strong className="text-primary">{order.id}</strong>
                                                            <br />
                                                            <small className="text-muted">{order.items} items {order.status.includes("in_trasit") ? "being" : ""} shipped</small>
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
                                                        <strong className="text-success">${order.value?.toLocaleString()}</strong>
                                                        <br />
                                                        <small className="text-muted">${(order.value / order.items)?.toFixed(0)}/item</small>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>Shipped:</strong> {new Date(order.shipDate)?.toLocaleDateString()}
                                                            <br />
                                                            <strong>Delivered:</strong> {new Date(order.deliveryDate)?.toLocaleDateString()}
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
            </Card>
        </div>
    )
}

export default ExportHistory;