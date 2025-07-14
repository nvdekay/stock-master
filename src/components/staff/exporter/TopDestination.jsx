import {
  Card,
  ListGroup,
} from "react-bootstrap"

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

export default TopDestinations;