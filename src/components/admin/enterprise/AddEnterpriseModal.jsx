import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Plus, X } from 'lucide-react';
import api from '../../../api/axiosInstance';

const AddEnterpriseModal = ({ isOpen, onClose, onSuccess }) => {
    const [enterpriseName, setEnterpriseName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!enterpriseName.trim()) {
            setError("Tên doanh nghiệp không được để trống.");
            setLoading(false);
            return;
        }

        try {
            // Check if enterprise name already exists
            const existingEnterprises = await api.get(`/enterprises?name=${enterpriseName.trim()}`);
            if (existingEnterprises.data.length > 0) {
                setError("Tên doanh nghiệp đã tồn tại.");
                setLoading(false);
                return;
            }

            const newEnterprise = {
                id: (Math.random() * 100000).toFixed(0).toString(),
                name: enterpriseName.trim(),
                status: 'active' // Default status to active
            };
            await api.post('/enterprises', newEnterprise);
            onSuccess();
            onClose();
            setEnterpriseName(''); // Reset form
        } catch (err) {
            console.error(err);
            setError('Thêm doanh nghiệp thất bại. ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold text-primary">Thêm Doanh nghiệp Mới</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                    <Form.Group controlId="formEnterpriseName" className="mb-3">
                        <Form.Label>Tên Doanh nghiệp</Form.Label>
                        <Form.Control
                            type="text"
                            value={enterpriseName}
                            onChange={(e) => setEnterpriseName(e.target.value)}
                            required
                            className="rounded-pill"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading} className="rounded-pill px-4 py-2">
                        <X size={16} className="me-2" />
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading} className="rounded-pill px-4 py-2">
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang thêm...
                            </>
                        ) : (
                            <>
                                <Plus size={16} className="me-2" />
                                Thêm Doanh nghiệp
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddEnterpriseModal;
