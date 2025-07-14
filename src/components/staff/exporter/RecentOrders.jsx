import {
  Card,
  Table,
  Badge,
  Button,
} from "react-bootstrap"
import {
  Eye,
  MapPin,
} from "lucide-react"
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

export default RecentOrders;