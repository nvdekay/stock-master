import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import axios from 'axios';

const EditEnterpriseModal = ({ enterprise, isOpen, onClose, onSuccess }) => {
    const [enterpriseName, setEnterpriseName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (enterprise) {
            setEnterpriseName(enterprise.name);
            setError(null);
        }
    }, [enterprise]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!enterpriseName.trim()) {
            setError("Tên doanh nghiệp không được để trống.");
            setLoading(false);
            return;
        }
        if (!enterprise) {
            setError("Không có doanh nghiệp nào được chọn để chỉnh sửa.");
            setLoading(false);
            return;
        }

        try {
            // Check if enterprise name already exists for other enterprises
            const existingEnterprises = await axios.get(`http://localhost:9999/enterprises?name=${enterpriseName.trim()}`);
            if (existingEnterprises.data.some(e => e.id !== enterprise.id)) {
                setError("Tên doanh nghiệp đã tồn tại.");
                setLoading(false);
                return;
            }

            const updatedEnterprise = { ...enterprise, name: enterpriseName.trim() };
            await axios.put(`http://localhost:9999/enterprises/${enterprise.id}`, updatedEnterprise);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Cập nhật doanh nghiệp thất bại. ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold text-primary">Chỉnh sửa Doanh nghiệp: {enterprise?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                    <Form.Group controlId="formEditEnterpriseName" className="mb-3">
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
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save size={16} className="me-2" />
                                Lưu Thay đổi
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditEnterpriseModal;
