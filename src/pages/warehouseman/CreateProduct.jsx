import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

function CreateProduct() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [productTypes, setProductTypes] = useState([]);
    const [warehouse, setWarehouse] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        warrantyExpire: '',
        productTypeId: '',
        src: '',
        status: 'available'
    });

    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, [user.warehouseId]);

    const fetchInitialData = async () => {
        try {
            const [typesRes, warehouseRes] = await Promise.all([
                api.get('/product_types'),
                api.get(`/warehouses/${user.warehouseId}`)
            ]);

            setProductTypes(typesRes.data);
            setWarehouse(warehouseRes.data);
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to load form data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'src') {
            setImagePreview(value);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                setFormData(prev => ({
                    ...prev,
                    src: dataUrl
                }));
                setImagePreview(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Product name is required');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Product description is required');
            return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Valid price is required');
            return false;
        }
        if (!formData.quantity || parseInt(formData.quantity) < 0) {
            setError('Valid quantity is required');
            return false;
        }
        if (!formData.warrantyExpire) {
            setError('Warranty expiry date is required');
            return false;
        }
        if (!formData.productTypeId) {
            setError('Product type is required');
            return false;
        }

        const warrantyDate = new Date(formData.warrantyExpire);
        const today = new Date();
        if (warrantyDate <= today) {
            setError('Warranty expiry date must be in the future');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                productTypeId: parseInt(formData.productTypeId),
                warehouseId: user.warehouseId,
                src: formData.src || 'https://i.pinimg.com/736x/57/fc/78/57fc78ba847be583534bafe58b8e8264.jpg'
            };

            console.log('Creating product:', productData);

            const response = await api.post('/products', productData);
            
            setSuccess(`Product "${response.data.name}" created successfully!`);
            
            setFormData({
                name: '',
                description: '',
                price: '',
                quantity: '',
                warrantyExpire: '',
                productTypeId: '',
                src: '',
                status: 'available'
            });
            setImagePreview('');

            setTimeout(() => {
                navigate('/warehouseman');
            }, 2000);

        } catch (err) {
            console.error('Error creating product:', err);
            setError(err.response?.data?.error || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1); 
        return today.toISOString().split('T')[0];
    };

    return (
        <Container fluid className="py-4">
            <Row className="justify-content-center">
                <Col lg={8} xl={6}>
                    <Card className="shadow">
                        <Card.Header>
                            <h4 className="m-3">
                                <i className="fas fa-plus-circle me-2"></i>
                                Create New Product
                            </h4>
                        </Card.Header>

                        <Card.Body className="p-4">
                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success" className="mb-3">
                                    <i className="fas fa-check-circle me-2"></i>
                                    {success}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Product Name <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter product name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Product Type <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Select
                                                name="productTypeId"
                                                value={formData.productTypeId}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select product type</option>
                                                {productTypes.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Description <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Enter product description"
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Price (VND) <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                                step="1000"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Quantity <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Warranty Expiry <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="warrantyExpire"
                                                value={formData.warrantyExpire}
                                                onChange={handleChange}
                                                min={getTodayDate()}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Product Image URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="src"
                                        value={formData.src}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <Form.Text className="text-muted">
                                        Enter an image URL or upload a file below
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Or Upload Image File</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <Form.Text className="text-muted">
                                        Supported formats: JPG, PNG, GIF
                                    </Form.Text>
                                </Form.Group>

                                {imagePreview && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Image Preview</Form.Label>
                                        <div className="d-flex justify-content-center">
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                style={{
                                                    maxWidth: '200px',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    backgroundColor: '#f8f9fa'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-4">
                                    <Form.Label>Status</Form.Label>
                                    <div>
                                        <Badge bg="success" className="fs-6">
                                            <i className="fas fa-check-circle me-1"></i>
                                            Available
                                        </Badge>
                                        <Form.Text className="text-muted d-block mt-1">
                                            New products are automatically set as available
                                        </Form.Text>
                                    </div>
                                </Form.Group>

                                <div className="d-flex gap-2 justify-content-end">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => navigate('/warehouseman')}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    className="me-2"
                                                />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-plus me-1"></i>
                                                Create Product
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default CreateProduct;