import {
  Card,
  Button,
  ButtonGroup
} from "react-bootstrap"

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

export default RevenueChart;