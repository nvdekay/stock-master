import {
  Card,
  ProgressBar,
} from "react-bootstrap"

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

export default OrderStatusChart;    