import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('danger');
    const [validated, setValidated] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validateForm = () => {
        const { fullName, username, email, password, confirmPassword } = formData;

        // Check if all fields are filled
        if (!fullName || !username || !email || !password || !confirmPassword) {
            setAlertMessage('Please fill in all fields');
            setAlertVariant('danger');
            setShowAlert(true);
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setAlertMessage('Please enter a valid email address');
            setAlertVariant('danger');
            setShowAlert(true);
            return false;
        }

        // Validate username (alphanumeric, 3-20 characters)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            setAlertMessage('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
            setAlertVariant('danger');
            setShowAlert(true);
            return false;
        }

        // Validate password strength
        if (password.length < 6) {
            setAlertMessage('Password must be at least 6 characters long');
            setAlertVariant('danger');
            setShowAlert(true);
            return false;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setAlertMessage('Passwords do not match');
            setAlertVariant('danger');
            setShowAlert(true);
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidated(true);

        if (validateForm()) {
            // Here you would typically make an API call to register the user
            console.log('Registration attempt:', formData);

            // Simulate registration process
            setAlertMessage('Registration successful! Welcome aboard!');
            setAlertVariant('success');
            setShowAlert(true);

            // Reset form after successful registration
            setTimeout(() => {
                setFormData({
                    fullName: '',
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                setShowAlert(false);
                setValidated(false);
            }, 3000);
        }
    };

    const getPasswordStrength = (password) => {
        if (password.length === 0) return '';
        if (password.length < 6) return 'weak';
        if (password.length < 10) return 'medium';
        return 'strong';
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary">Create Account</h2>
                                <p className="text-muted">Join us today! Please fill in your information</p>
                            </div>

                            {showAlert && (
                                <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
                                    {alertMessage}
                                </Alert>
                            )}

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        required
                                        isInvalid={validated && !formData.fullName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide your full name.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Choose a username"
                                        required
                                        isInvalid={validated && !formData.username}
                                    />
                                    <Form.Text className="text-muted">
                                        3-20 characters, letters, numbers, and underscores only
                                    </Form.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Please choose a valid username.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email address"
                                        required
                                        isInvalid={validated && !formData.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid email address.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Create a password"
                                        required
                                        isInvalid={validated && !formData.password}
                                    />
                                    {formData.password && (
                                        <div className="mt-1">
                                            <small className={`text-${passwordStrength === 'weak' ? 'danger' : passwordStrength === 'medium' ? 'warning' : 'success'}`}>
                                                Password strength: {passwordStrength}
                                            </small>
                                        </div>
                                    )}
                                    <Form.Text className="text-muted">
                                        Minimum 6 characters required
                                    </Form.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid password.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm your password"
                                        required
                                        isInvalid={validated && (!formData.confirmPassword || formData.password !== formData.confirmPassword)}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Passwords must match.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-grid gap-2 mb-3">
                                    <Button variant="primary" type="submit" size="lg">
                                        Create Account
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <p className="mb-2">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-decoration-none">
                                            Sign in here
                                        </Link>
                                    </p>
                                    <Link to="/" className="text-decoration-none text-muted">
                                        ← Back to Home
                                    </Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterPage;