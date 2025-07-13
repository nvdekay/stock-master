
import { useState } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Alert,
  ProgressBar,
  ListGroup,
  Navbar,
  Nav,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap"
import {
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bell,
  Settings,
  Download,
  Plus,
  Eye,
  BarChart3,
  MapPin,
  Truck,
  Star,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

// Mock data for dashboard
const dashboardData = {
  kpis: {
    totalRevenue: 2450000,
    revenueGrowth: 12.5,
    ordersThisMonth: 156,
    ordersGrowth: 8.3,
    pendingShipments: 23,
    pendingGrowth: -5.2,
    customerSatisfaction: 4.7,
    satisfactionGrowth: 3.1,
  },
  monthlyRevenue: [
    { month: "Jan", revenue: 180000, orders: 45 },
    { month: "Feb", revenue: 220000, orders: 52 },
    { month: "Mar", revenue: 195000, orders: 48 },
    { month: "Apr", revenue: 285000, orders: 67 },
    { month: "May", revenue: 310000, orders: 72 },
    { month: "Jun", revenue: 275000, orders: 65 },
  ],
  topDestinations: [
    { country: "Germany", orders: 45, revenue: 580000, flag: "🇩🇪" },
    { country: "USA", orders: 38, revenue: 520000, flag: "🇺🇸" },
    { country: "Netherlands", orders: 32, revenue: 445000, flag: "🇳🇱" },
    { country: "Japan", orders: 28, revenue: 390000, flag: "🇯🇵" },
    { country: "France", orders: 25, revenue: 350000, flag: "🇫🇷" },
  ],
  recentOrders: [
    {
      id: "EXP-2024-158",
      customer: "Global Trade Corp",
      destination: "Hamburg, Germany",
      value: 125000,
      status: "Processing",
      date: "2024-01-22",
      priority: "High",
    },
    {
      id: "EXP-2024-159",
      customer: "Pacific Imports Inc",
      destination: "Los Angeles, USA",
      value: 89000,
      status: "Ready to Ship",
      date: "2024-01-22",
      priority: "Medium",
    },
    {
      id: "EXP-2024-160",
      customer: "Euro Distribution SA",
      destination: "Barcelona, Spain",
      value: 76000,
      status: "Customs Clearance",
      date: "2024-01-21",
      priority: "Low",
    },
    {
      id: "EXP-2024-161",
      customer: "Nordic Trade AS",
      destination: "Oslo, Norway",
      value: 112000,
      status: "Documentation",
      date: "2024-01-21",
      priority: "High",
    },
  ],
  alerts: [
    {
      type: "warning",
      title: "Customs Delay",
      message: "3 shipments delayed at Hamburg customs. Expected resolution: 2 days.",
      time: "2 hours ago",
    },
    {
      type: "success",
      title: "Large Order Completed",
      message: "Order EXP-2024-145 worth $250,000 successfully delivered to Tokyo.",
      time: "4 hours ago",
    },
    {
      type: "info",
      title: "New Customer Registration",
      message: "Mediterranean Logistics Ltd has registered as a new customer.",
      time: "6 hours ago",
    },
  ],
  orderStatus: {
    processing: 15,
    readyToShip: 8,
    inTransit: 12,
    delivered: 89,
    delayed: 3,
  },
}

const KPICard = ({ title, value, growth, icon: Icon, prefix = "", suffix = "", variant = "primary" }) => {
  const isPositive = growth > 0
  const GrowthIcon = isPositive ? ArrowUp : ArrowDown
  const growthColor = isPositive ? "success" : "danger"

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="text-muted mb-2 fw-normal">{title}</h6>
            <h3 className="mb-0 fw-bold">
              {prefix}
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix}
            </h3>
          </div>
          <div className={`text-${variant} bg-${variant} bg-opacity-10 p-2 rounded`}>
            <Icon size={24} />
          </div>
        </div>
        <div className="d-flex align-items-center mt-3">
          <GrowthIcon size={16} className={`text-${growthColor} me-1`} />
          <span className={`text-${growthColor} fw-semibold me-2`}>{Math.abs(growth)}%</span>
          <span className="text-muted small">vs last month</span>
        </div>
      </Card.Body>
    </Card>
  )
}

const RevenueChart = ({ data }) => {
  const maxRevenue = Math.max(...data.map((item) => item.revenue))

  return (
    <Card className="h-100">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">Monthly Revenue Trend</h6>
          <ButtonGroup size="sm">
            <Button variant="outline-primary" active>
              6M
            </Button>
            <Button variant="outline-secondary">1Y</Button>
          </ButtonGroup>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-end justify-content-between" style={{ height: "200px" }}>
          {data.map((item, index) => (
            <div key={index} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
              <div className="text-center mb-2">
                <small className="text-muted">${(item.revenue / 1000).toFixed(0)}k</small>
              </div>
              <div
                className="bg-primary rounded-top"
                style={{
                  width: "30px",
                  height: `${(item.revenue / maxRevenue) * 150}px`,
                  minHeight: "10px",
                }}
              ></div>
              <div className="mt-2">
                <small className="text-muted fw-semibold">{item.month}</small>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}

const OrderStatusChart = ({ data }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  const statusConfig = {
    processing: { color: "primary", label: "Processing" },
    readyToShip: { color: "success", label: "Ready to Ship" },
    inTransit: { color: "info", label: "In Transit" },
    delivered: { color: "success", label: "Delivered" },
    delayed: { color: "danger", label: "Delayed" },
  }

  return (
    <Card className="h-100">
      <Card.Header className="bg-white border-bottom">
        <h6 className="mb-0 fw-semibold">Order Status Distribution</h6>
      </Card.Header>
      <Card.Body>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">{total}</h2>
          <p className="text-muted mb-0">Total Active Orders</p>
        </div>
        <div className="space-y-3">
          {Object.entries(data).map(([status, count]) => {
            const percentage = ((count / total) * 100).toFixed(1)
            const config = statusConfig[status]
            return (
              <div key={status} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold">{config.label}</span>
                  <span className="small text-muted">
                    {count} ({percentage}%)
                  </span>
                </div>
                <ProgressBar variant={config.color} now={percentage} style={{ height: "8px" }} />
              </div>
            )
          })}
        </div>
      </Card.Body>
    </Card>
  )
}

const TopDestinations = ({ destinations }) => {
  return (
    <Card className="h-100">
      <Card.Header className="bg-white border-bottom">
        <h6 className="mb-0 fw-semibold">Top Export Destinations</h6>
      </Card.Header>
      <Card.Body className="p-0">
        <ListGroup variant="flush">
          {destinations.map((dest, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center">
                <span className="fs-4 me-3">{dest.flag}</span>
                <div>
                  <div className="fw-semibold">{dest.country}</div>
                  <small className="text-muted">{dest.orders} orders</small>
                </div>
              </div>
              <div className="text-end">
                <div className="fw-semibold text-success">${dest.revenue.toLocaleString()}</div>
                <small className="text-muted">Revenue</small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

const RecentOrders = ({ orders }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case "Ready to Ship":
        return "success"
      case "Processing":
        return "primary"
      case "Documentation":
        return "warning"
      case "Customs Clearance":
        return "info"
      default:
        return "secondary"
    }
  }

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

  return (
    <Card className="h-100">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">Recent Orders</h6>
          <Button variant="outline-primary" size="sm">
            View All
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="border-0">Order</th>
                <th className="border-0">Customer</th>
                <th className="border-0">Value</th>
                <th className="border-0">Status</th>
                <th className="border-0">Priority</th>
                <th className="border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div>
                      <div className="fw-semibold text-primary">{order.id}</div>
                      <small className="text-muted">{new Date(order.date).toLocaleDateString()}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="fw-semibold">{order.customer}</div>
                      <small className="text-muted">
                        <MapPin size={12} className="me-1" />
                        {order.destination}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span className="fw-semibold text-success">${order.value.toLocaleString()}</span>
                  </td>
                  <td>
                    <Badge bg={getStatusVariant(order.status)} className="px-2 py-1">
                      {order.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getPriorityVariant(order.priority)} className="px-2 py-1">
                      {order.priority}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm">
                      <Eye size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  )
}

const AlertsPanel = ({ alerts }) => {
  const getAlertVariant = (type) => {
    switch (type) {
      case "warning":
        return "warning"
      case "success":
        return "success"
      case "info":
        return "info"
      case "danger":
        return "danger"
      default:
        return "secondary"
    }
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={16} />
      case "success":
        return <CheckCircle size={16} />
      case "info":
        return <Bell size={16} />
      default:
        return <Bell size={16} />
    }
  }

  return (
    <Card className="h-100">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">Recent Alerts</h6>
          <Badge bg="danger" className="rounded-pill">
            {alerts.length}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {alerts.map((alert, index) => (
          <Alert key={index} variant={getAlertVariant(alert.type)} className="mb-0 rounded-0 border-0 border-bottom">
            <div className="d-flex align-items-start">
              <div className="me-3 mt-1">{getAlertIcon(alert.type)}</div>
              <div className="flex-grow-1">
                <Alert.Heading className="h6 mb-1">{alert.title}</Alert.Heading>
                <p className="mb-1 small">{alert.message}</p>
                <small className="text-muted">{alert.time}</small>
              </div>
            </div>
          </Alert>
        ))}
      </Card.Body>
    </Card>
  )
}

const QuickActions = () => {
  return (
    <Card className="h-100">
      <Card.Header className="bg-white border-bottom">
        <h6 className="mb-0 fw-semibold">Quick Actions</h6>
      </Card.Header>
      <Card.Body>
        <div className="d-grid gap-2">
          <Button variant="primary" className="d-flex align-items-center justify-content-center">
            <Plus size={16} className="me-2" />
            Create New Order
          </Button>
          <Button variant="outline-success" className="d-flex align-items-center justify-content-center">
            <Download size={16} className="me-2" />
            Generate Report
          </Button>
          <Button variant="outline-info" className="d-flex align-items-center justify-content-center">
            <BarChart3 size={16} className="me-2" />
            View Analytics
          </Button>
          <Button variant="outline-warning" className="d-flex align-items-center justify-content-center">
            <Truck size={16} className="me-2" />
            Track Shipments
          </Button>
          <Button variant="outline-secondary" className="d-flex align-items-center justify-content-center">
            <Users size={16} className="me-2" />
            Manage Customers
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default function ExporterDashboard() {
  const [timeRange, setTimeRange] = useState("6M")

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand className="fw-bold">
            <Package className="me-2" size={24} />
            Export Dashboard
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm">
                <Bell size={16} className="me-1" />
                Notifications
                <Badge bg="danger" className="ms-2 rounded-pill">
                  3
                </Badge>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>New order received</Dropdown.Item>
                <Dropdown.Item>Shipment delayed</Dropdown.Item>
                <Dropdown.Item>Customer feedback</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>View all notifications</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link className="text-light ms-2">
              <Settings size={20} />
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container fluid className="py-4">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">Welcome back, Export Manager!</h2>
                <p className="text-muted mb-0">Here's what's happening with your export operations today.</p>
              </div>
              <div className="text-end">
                <div className="text-muted small">Last updated</div>
                <div className="fw-semibold">{new Date().toLocaleString()}</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* KPI Cards */}
        <Row className="mb-4">
          <Col xl={3} lg={6} className="mb-3">
            <KPICard
              title="Total Revenue"
              value={dashboardData.kpis.totalRevenue}
              growth={dashboardData.kpis.revenueGrowth}
              icon={DollarSign}
              prefix="$"
              variant="success"
            />
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <KPICard
              title="Orders This Month"
              value={dashboardData.kpis.ordersThisMonth}
              growth={dashboardData.kpis.ordersGrowth}
              icon={Package}
              variant="primary"
            />
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <KPICard
              title="Pending Shipments"
              value={dashboardData.kpis.pendingShipments}
              growth={dashboardData.kpis.pendingGrowth}
              icon={Clock}
              variant="warning"
            />
          </Col>
          <Col xl={3} lg={6} className="mb-3">
            <KPICard
              title="Customer Satisfaction"
              value={dashboardData.kpis.customerSatisfaction}
              growth={dashboardData.kpis.satisfactionGrowth}
              icon={Star}
              suffix="/5"
              variant="info"
            />
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="mb-4">
          <Col lg={8} className="mb-3">
            <RevenueChart data={dashboardData.monthlyRevenue} />
          </Col>
          <Col lg={4} className="mb-3">
            <OrderStatusChart data={dashboardData.orderStatus} />
          </Col>
        </Row>

        {/* Content Row */}
        <Row className="mb-4">
          <Col lg={8} className="mb-3">
            <RecentOrders orders={dashboardData.recentOrders} />
          </Col>
          <Col lg={4} className="mb-3">
            <TopDestinations destinations={dashboardData.topDestinations} />
          </Col>
        </Row>

        {/* Bottom Row */}
        <Row>
          <Col lg={8} className="mb-3">
            <AlertsPanel alerts={dashboardData.alerts} />
          </Col>
          <Col lg={4} className="mb-3">
            <QuickActions />
          </Col>
        </Row>

        {/* Performance Summary */}
        <Row className="mt-4">
          <Col>
            <Alert variant="info" className="border-0 shadow-sm">
              <div className="d-flex align-items-center">
                <TrendingUp className="me-3" size={24} />
                <div>
                  <Alert.Heading className="h6 mb-1">Performance Summary</Alert.Heading>
                  <p className="mb-0">
                    Your export operations are performing well with a{" "}
                    <strong>{dashboardData.kpis.revenueGrowth}% revenue growth</strong> this month. You have{" "}
                    <strong>{dashboardData.kpis.pendingShipments} pending shipments</strong> and an average customer
                    satisfaction rating of <strong>{dashboardData.kpis.customerSatisfaction}/5</strong>.
                  </p>
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
