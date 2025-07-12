import axios from 'axios';
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../api/axiosInstance';

const LoginPage = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: ''
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('danger');

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.usernameOrEmail || !formData.password) {
            setAlertMessage('Please fill in all fields');
            setAlertVariant('danger');
            setShowAlert(true);
            return;
        }

        // Here you would typically make an API call to authenticate the user
        // console.log('Login attempt:', formData);

        try {
            const response = await api.post("/login", {
                username: formData.usernameOrEmail,
                password: formData.password
            });

            // console.log("Login response:", response.data);

            // If your server returns { accessToken, user }
            const { accessToken, user } = response.data;

            // console.log("response data: ", user)

            // the following lines was already done in login method below
            // localStorage.setItem("user", JSON.stringify(user));
            // localStorage.setItem("token", JSON.stringify(accessToken));

            // Save to context + localStorage
            login(user, accessToken);

            // Simulate login process
            setAlertMessage('Login successful!');
            setAlertVariant('success');
            setShowAlert(true);

            // Reset form after successful login
            setTimeout(() => {
                setFormData({ usernameOrEmail: '', password: '' });
                setShowAlert(false);
                switch (user.role.toLowerCase()) {
                    case "admin": navigate("/admin/dashboard")
                        break;
                    case "manager": navigate("/manager")
                        break;
                    case "shipper": navigate("/shipper")
                        break;
                    // thêm các role tương tự nếu có
                    // case "shipper": navigate("/shipper")
                    // break;
                    default: navigate("/");
                        break;
                }

            }, 1500);

            setAlertMessage('Login successful! Redirecting...')
            setAlertVariant('success');
            setShowAlert(true);

        } catch (err) {
            console.error("Login error:", err);
            switch (err.code) {
                case "ERR_BAD_REQUEST":
                    setAlertMessage("Invalid username or password")
                    break;
                case "ERR_NETWORK":
                    setAlertMessage("The something wrong with the server! Please try again later");
                    break;
            }
            setAlertVariant('danger');
            setShowAlert(true);
        }


    };

    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={4}>
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary">Welcome Back</h2>
                                <p className="text-muted">Please sign in to your account</p>
                            </div>

                            {showAlert && (
                                <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
                                    {alertMessage}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username or Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="usernameOrEmail"
                                        value={formData.usernameOrEmail}
                                        onChange={handleInputChange}
                                        placeholder="Enter your username or email"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2 mb-3">
                                    <Button variant="primary" type="submit" size="lg">
                                        Login
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <Link to="/" className="text-decoration-none">
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

export default LoginPage;