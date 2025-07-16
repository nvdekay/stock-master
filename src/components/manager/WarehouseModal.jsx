import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Tab, Tabs } from 'react-bootstrap';

function WarehouseModal({ show, onClose, onSubmit, warehouse }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    location: '',
    warehouseman: {
      fullName: '',
      username: '',
      email: '',
      password: '123456'
    }
  });
  const [activeTab, setActiveTab] = useState('warehouse');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        location: warehouse.location || '',
        warehouseman: warehouse.warehouseman ? {
          fullName: warehouse.warehouseman.fullName || '',
          username: warehouse.warehouseman.username || '',
          email: warehouse.warehouseman.email || '',
          password: '123456',
          id: warehouse.warehouseman.id
        } : {
          fullName: '',
          username: '',
          email: '',
          password: '123456'
        }
      });
    } else {
      setFormData({ 
        name: '', 
        location: '',
        warehouseman: {
          fullName: '',
          username: '',
          email: '',
          password: '123456'
        }
      });
    }
    setErrors({});
    setActiveTab('warehouse');
  }, [warehouse]);

  const handleWarehouseChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWarehousemanChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      warehouseman: {
        ...prev.warehouseman,
        [field]: value
      }
    }));
  };

  const generateUsername = (name) => {
    if (!name) return '';
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    return `wm_${cleanName}`;
  };

  const generateEmail = (name) => {
    if (!name) return '';
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '');
    return `${cleanName}@warehouse.com`;
  };

  const handleWarehouseNameChange = (value) => {
    handleWarehouseChange('name', value);
    
    if (!warehouse && value) {
      const managerName = `Manager ${value}`;
      const username = generateUsername(value);
      const email = generateEmail(value);
      
      setFormData(prev => ({
        ...prev,
        warehouseman: {
          ...prev.warehouseman,
          fullName: managerName,
          username: username,
          email: email
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Warehouse name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    const hasAnyManagerField = formData.warehouseman.fullName.trim() || 
                              formData.warehouseman.username.trim() || 
                              formData.warehouseman.email.trim();

    if (hasAnyManagerField) {
      if (!formData.warehouseman.fullName.trim()) {
        newErrors['warehouseman.fullName'] = 'Manager full name is required';
      }

      if (!formData.warehouseman.username.trim()) {
        newErrors['warehouseman.username'] = 'Username is required';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.warehouseman.username.trim())) {
        newErrors['warehouseman.username'] = 'Username can only contain letters, numbers, and underscores';
      }

      if (!formData.warehouseman.email.trim()) {
        newErrors['warehouseman.email'] = 'Email is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.warehouseman.email.trim())) {
          newErrors['warehouseman.email'] = 'Please enter a valid email address';
        }
      }

      if (formData.warehouseman.password.trim().length < 6) {
        newErrors['warehouseman.password'] = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      if (errors.name || errors.location) {
        setActiveTab('warehouse');
      } else {
        setActiveTab('manager');
      }
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {warehouse ? 'Edit Warehouse' : 'Create New Warehouse'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
          <Tab eventKey="warehouse" title={
            <span>
              Warehouse Info
              {(errors.name || errors.location) && <i className="fas fa-exclamation-circle text-danger ms-1"></i>}
            </span>
          }>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Warehouse Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Central Warehouse HCM"
                  value={formData.name}
                  onChange={(e) => handleWarehouseNameChange(e.target.value)}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., District 1, Ho Chi Minh City"
                  value={formData.location}
                  onChange={(e) => handleWarehouseChange('location', e.target.value)}
                  isInvalid={!!errors.location}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.location}
                </Form.Control.Feedback>
              </Form.Group>

              {warehouse && warehouse.warehouseman && (
                <Alert variant="info">
                  <strong>Current Manager:</strong> {warehouse.warehouseman.fullName} ({warehouse.warehouseman.username})
                </Alert>
              )}
            </Form>
          </Tab>

          <Tab eventKey="manager" title={
            <span>
              Warehouse Manager
              {(errors['warehouseman.fullName'] || errors['warehouseman.username'] || errors['warehouseman.email'] || errors['warehouseman.password']) && 
                <i className="fas fa-exclamation-circle text-danger ms-1"></i>
              }
            </span>
          }>
            <Alert variant="info" className="mb-3">
              <strong>Note:</strong> You can assign a warehouse manager now or leave empty to assign later.
            </Alert>

            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter manager's full name"
                      value={formData.warehouseman.fullName}
                      onChange={(e) => handleWarehousemanChange('fullName', e.target.value)}
                      isInvalid={!!errors['warehouseman.fullName']}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors['warehouseman.fullName']}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={formData.warehouseman.username}
                      onChange={(e) => handleWarehousemanChange('username', e.target.value)}
                      isInvalid={!!errors['warehouseman.username']}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors['warehouseman.username']}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email address"
                  value={formData.warehouseman.email}
                  onChange={(e) => handleWarehousemanChange('email', e.target.value)}
                  isInvalid={!!errors['warehouseman.email']}
                />
                <Form.Control.Feedback type="invalid">
                  {errors['warehouseman.email']}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Default Password</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.warehouseman.password}
                  onChange={(e) => handleWarehousemanChange('password', e.target.value)}
                  placeholder="Default password"
                  isInvalid={!!errors['warehouseman.password']}
                />
                <Form.Control.Feedback type="invalid">
                  {errors['warehouseman.password']}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Manager can change this password after first login
                </Form.Text>
              </Form.Group>

              {warehouse && (
                <Alert variant="warning">
                  <strong>Editing Manager:</strong> Changes will update the existing manager account.
                </Alert>
              )}
            </Form>
          </Tab>
        </Tabs>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {warehouse ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default WarehouseModal;
