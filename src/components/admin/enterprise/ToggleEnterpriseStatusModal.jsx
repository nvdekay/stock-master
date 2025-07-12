import React, { useState } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';

const ToggleEnterpriseStatusModal = ({ enterprise, isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleToggleStatus = async () => {
        setLoading(true);
        setError(null);
        if (!enterprise) {
            setError("Không có doanh nghiệp nào được chọn.");
            setLoading(false);
            return;
        }

        const newStatus = enterprise.status === 'active' ? 'banned' : 'active';
        try {
            await axios.put(`http://localhost:9999/enterprises/${enterprise.id}`, { ...enterprise, status: newStatus });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(`Chuyển trạng thái doanh nghiệp thất bại. ` + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold text-primary">
                    {enterprise?.status === 'active' ? 'Cấm Doanh nghiệp' : 'Bỏ cấm Doanh nghiệp'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                <p>Bạn có chắc chắn muốn {enterprise?.status === 'active' ? 'cấm' : 'bỏ cấm'} doanh nghiệp <strong>{enterprise?.name}</strong> không?</p>
                <p className="text-muted small">Hành động này sẽ {enterprise?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt lại'} tài khoản liên quan và ảnh hưởng đến các hoạt động của doanh nghiệp.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading} className="rounded-pill px-4 py-2">
                    <X size={16} className="me-2" />
                    Hủy
                </Button>
                <Button
                    variant={enterprise?.status === 'active' ? 'danger' : 'success'}
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className="rounded-pill px-4 py-2"
                >
                    {loading ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                    ) : enterprise?.status === 'active' ? (
                        <><Trash2 size={16} className="me-2" /> Cấm</>
                    ) : (
                        <><Plus size={16} className="me-2" /> Bỏ cấm</>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ToggleEnterpriseStatusModal;
