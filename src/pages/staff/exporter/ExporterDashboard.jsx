import { useState } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
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
import AlertsPanel from "../../../components/staff/exporter/AlertsPanel"
import RecentOrders from "../../../components/staff/exporter/RecentOrders"
import TopDestinations from "../../../components/staff/exporter/TopDestination"
import QuickActions from "../../../components/staff/exporter/QuickAction"

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


export default function ExporterDashboard() {
  const [timeRange, setTimeRange] = useState("6M")

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">Welcome back, Exporter!</h2>
                <p className="text-muted mb-0">Here's what's happening with your export operations today.</p>
              </div>
              {/* <div className="text-end">
                <div className="text-muted small">Last updated</div>
                <div className="fw-semibold">{new Date().toLocaleString()}</div>
              </div> */}
            </div>
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

      </Container>
    </div>
  )
}
{/* KPI Cards */}
        {/* <Row className="mb-4">
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
        </Row> */}

        {/* Charts Row */}
        {/* <Row className="mb-4">
          <Col lg={8} className="mb-3">
            <RevenueChart data={dashboardData.monthlyRevenue} />
          </Col>
          <Col lg={4} className="mb-3">
            <OrderStatusChart data={dashboardData.orderStatus} />
          </Col>
        </Row>
 */}