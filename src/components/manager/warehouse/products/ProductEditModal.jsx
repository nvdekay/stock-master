import { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import api from '../../../../api/axiosInstance';

const calculateStatus = (warrantyDate, quantity) => {
    const today = new Date().toISOString().split('T')[0];
    if (warrantyDate && warrantyDate < today) {
        return 'expired'; 
    }
    if (Number(quantity) === 0) {
        return 'out_of_stock'; 
    }
    return 'available';
};

function ProductEditModal({ show, onHide, product, warehouse, onSuccess }) {
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (product) {
            const initialQuantity = product.quantity || 0;
            const initialWarranty = product.warrantyExpire ? product.warrantyExpire.split('T')[0] : '';

            setEditForm({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                status: calculateStatus(initialWarranty, initialQuantity),
                warrantyExpire: initialWarranty,
                quantity: initialQuantity,
                src: product.src || '' 
            });
            setImagePreview(product.src || '');
            setError('');
            setSuccess('');
        }
    }, [product]);

    const handleFormChange = (field, value) => {
        let newForm = {
            ...editForm,
            [field]: value
        };
        
        if (field === 'quantity' && Number(value) < 0) {
            return;
        }

        const newStatus = calculateStatus(newForm.warrantyExpire, newForm.quantity);
        newForm.status = newStatus;

        setEditForm(newForm);
    };

    const handleImageChange = (value) => {
        setEditForm(prev => ({
            ...prev,
            src: value
        }));
        setImagePreview(value);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                handleImageChange(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!editForm.name || !editForm.description || !editForm.price) {
            setError('Please fill in all required fields (Name, Description, Price)');
            return false;
        }

        if (!editForm.warrantyExpire) {
            setError('Warranty Expiry date is required.');
            return false;
        }

        if (editForm.price <= 0) {
            setError('Price must be greater than 0');
            return false;
        }

        if (editForm.quantity < 0) {
            setError('Quantity cannot be negative');
            return false;
        }

        setError('');
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await api.put(`/products/${product.id}`, {
                name: editForm.name,
                description: editForm.description,
                price: Number(editForm.price),
                status: editForm.status,
                warrantyExpire: editForm.warrantyExpire,
                quantity: Number(editForm.quantity),
                warehouseId: warehouse.id,
                src: editForm.src || 'https://i.pinimg.com/736x/57/fc/78/57fc78ba847be583534bafe58b8e8264.jpg'
            });

            setSuccess('Product updated successfully');
            setTimeout(() => {
                onHide();
                onSuccess();
            }, 1000);

        } catch (err) {
            console.error('Error updating product:', err);
            setError(err.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEditForm({});
        setError('');
        setSuccess('');
        onHide();
    };
    
    const getStatusInfo = (status) => {
        switch (status) {
            case 'expired':
                return { variant: 'danger', text: 'Expired', icon: 'fa-calendar-times' };
            case 'out_of_stock':
                return { variant: 'secondary', text: 'Out of Stock', icon: 'fa-box-open' };
            case 'available':
                return { variant: 'success', text: 'Available', icon: 'fa-check-circle' };
            default:
                return { variant: 'info', text: 'Unknown', icon: 'fa-question-circle' };
        }
    };

    if (!product) return null;

    const statusInfo = getStatusInfo(editForm.status);

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-edit me-2"></i>
                    Edit Product
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Alert variant={statusInfo.variant}>
                    <strong>Calculated Status: </strong>
                    <i className={`fas ${statusInfo.icon} me-1`}></i>
                    {statusInfo.text}
                </Alert>
                
                <Form>
                    {imagePreview && (
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Label>Current Image</Form.Label>
                                <div className="d-flex justify-content-center">
                                    <img
                                        src={imagePreview}
                                        alt="Product preview"
                                        style={{
                                            maxWidth: '150px',
                                            maxHeight: '150px',
                                            objectFit: 'contain',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                        onError={(e) => {
                                            e.target.src = '/assets/images/products/default.jpg';
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                    )}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Product Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editForm.name || ''}
                                    onChange={(e) => handleFormChange('name', e.target.value)}
                                    placeholder="Enter product name"
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Price (VND) *</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editForm.price || ''}
                                    onChange={(e) => handleFormChange('price', e.target.value)}
                                    placeholder="Enter price"
                                    min="0"
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Description *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={editForm.description || ''}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            placeholder="Enter product description"
                            disabled={loading}
                        />
                    </Form.Group>

                    {/* Image URL field */}
                    <Form.Group className="mb-3">
                        <Form.Label>Product Image URL</Form.Label>
                        <Form.Control
                            type="url"
                            value={editForm.src || ''}
                            onChange={(e) => handleImageChange(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            disabled={loading}
                        />
                        <Form.Text className="text-muted">
                            Enter an image URL or upload a file below
                        </Form.Text>
                    </Form.Group>

                    {/* File upload */}
                    <Form.Group className="mb-3">
                        <Form.Label>Or Upload Image File</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={loading}
                        />
                        <Form.Text className="text-muted">
                            Supported formats: JPG, PNG, GIF
                        </Form.Text>
                    </Form.Group>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Quantity *</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editForm.quantity}
                                    onChange={(e) => handleFormChange('quantity', e.target.value)}
                                    placeholder="Enter quantity"
                                    min="0"
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Warranty Expiry *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={editForm.warrantyExpire || ''}
                                    onChange={(e) => handleFormChange('warrantyExpire', e.target.value)}
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted">
                                    If the date is in the past, status will be set to 'Expired'.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Alert variant="info">
                        <strong>Current Warehouse:</strong> {warehouse.name}<br/>
                        <strong>Original Quantity:</strong> {product.quantity}<br/>
                        <strong>New Quantity:</strong> {editForm.quantity || 0}
                    </Alert>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ProductEditModal;