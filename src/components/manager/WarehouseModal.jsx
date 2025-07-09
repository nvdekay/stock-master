import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function WarehouseModal({ show, onClose, onSubmit, warehouse, enterpriseName }) {
  const [formData, setFormData] = useState({ name: '', location: '' });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        location: warehouse.location || '',
      });
    } else {
      setFormData({ name: '', location: '' });
    }
  }, [warehouse]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{warehouse ? 'Chỉnh sửa kho' : 'Thêm kho mới'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tên kho *</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Ví dụ: Kho trung tâm HCM"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ *</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Ví dụ: Quận 1, TP.HCM"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Doanh nghiệp</Form.Label>
            <Form.Control type="text" value={enterpriseName || ''} disabled className="bg-light" />
            <Form.Text className="text-muted">Kho sẽ thuộc về doanh nghiệp hiện tại của bạn.</Form.Text>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>Hủy</Button>
            <Button variant="primary" type="submit">{warehouse ? 'Cập nhật' : 'Tạo mới'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default WarehouseModal;
