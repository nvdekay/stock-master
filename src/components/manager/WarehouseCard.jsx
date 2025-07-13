import { Card, Button, Dropdown, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function WarehouseCard({ warehouse, onEdit, onDelete, onView, isOwner }) {
  const navigate = useNavigate();
  return (
    <Card
      className="h-100 shadow-sm"
      style={{
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Card.Body className="d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1 me-3">
            <h5 className="mb-1 fw-bold ">
              {warehouse.name}
            </h5>
            <div className="d-flex align-items-center text-muted small">
              <i className="fas fa-map-marker-alt me-2"></i>
              <span>{warehouse.location || 'Chưa có địa chỉ'}</span>
            </div>
          </div>
          {isOwner && (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id={`dropdown-warehouse-${warehouse.id}`}
                className="p-0 text-muted"
                style={{ textDecoration: 'none', border: 'none', background: 'none', boxShadow: 'none' }}
              >
                <i className="fas fa-ellipsis-v fa-fw"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => onEdit(warehouse)}>
                  <i className="fas fa-edit me-2 "></i>
                  Edit
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onDelete(warehouse.id)} className="text-danger">
                  <i className="fas fa-trash me-2"></i>
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        <Row className="text-center my-3 py-3 bg-light rounded">
          <Col>
            <div>
              <i className="fas fa-boxes-stacked fa-lg text-info mb-2"></i>
              <h5 className="mb-0 fw-bold">{warehouse.totalQuantity || 0}</h5>
              <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>Total Inventory</p>
            </div>
          </Col>
          <Col>
            <div>
              <i className="fas fa-box fa-lg text-success mb-2"></i>
              <h5 className="mb-0 fw-bold">{warehouse.productCount || 0}</h5>
              <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>Products</p>
            </div>
          </Col>
          <Col>
            <div>
              <i className="fas fa-users fa-lg text-warning mb-2"></i>
              <h5 className="mb-0 fw-bold">{warehouse.staffCount || 0}</h5>
              <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>Staff</p>
            </div>
          </Col>
        </Row>

        <div className="d-flex justify-content-center mt-3">
          <Button
            variant="success"
            className="w-50 fw-bold"
            onClick={() => navigate(`/manager/warehouse/${warehouse.id}`)}
          >
            View Details
          </Button>
        </div>

      </Card.Body>
    </Card>
  );
}

export default WarehouseCard;