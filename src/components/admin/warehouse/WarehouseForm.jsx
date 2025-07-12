// src/components/admin/warehouse/WarehouseForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

const WarehouseForm = ({ initialData, onSave, onCancel, enterprises }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        enterpriseId: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                location: initialData.location,
                enterpriseId: initialData.enterpriseId || ''
            });
        } else {
            setFormData({
                name: '',
                location: '',
                enterpriseId: ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: initialData ? initialData.id : undefined });
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mb-3" controlId="formWarehouseName">
                <Form.Label column sm="3">Tên Kho:</Form.Label>
                <Col sm="9">
                    <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formWarehouseLocation">
                <Form.Label column sm="3">Địa điểm:</Form.Label>
                <Col sm="9">
                    <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formWarehouseEnterprise">
                <Form.Label column sm="3">Doanh nghiệp:</Form.Label>
                <Col sm="9">
                    <Form.Select
                        name="enterpriseId"
                        value={formData.enterpriseId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Chọn doanh nghiệp --</option>
                        {enterprises.map(enterprise => (
                            <option key={enterprise.id} value={enterprise.id}>
                                {enterprise.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Form.Group>

            <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={onCancel} className="me-2">
                    Hủy
                </Button>
                <Button variant="primary" type="submit">
                    Lưu
                </Button>
            </div>
        </Form>
    );
};

export default WarehouseForm;