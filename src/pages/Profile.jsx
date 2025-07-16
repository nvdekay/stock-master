import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap"
import { User, Mail, MapPin, Building, Warehouse } from "lucide-react"

export default function UserProfile() {
    const [formData, setFormData] = useState({
        username: "john_doe",
        fullName: "John Doe",
        email: "john.doe@company.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY, USA",
        role: "enterprise_manager",
        enterpriseName: "Tech Solutions Inc.",
        warehouseName: "Main Distribution Center",
    })

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const showEnterpriseFields = ["staff", "warehouse_manager", "enterprise_manager"].includes(formData.role)

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Form submitted:", formData)
        // Handle form submission here
    }

    return (
        <Container className="py-4">
            <div className="mb-4">
                <h1 className="display-5 fw-bold">User Profile</h1>
                <p className="text-muted">Manage your account information and preferences</p>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    {/* Personal Information */}
                    <Col md={6}>
                        <Card className="h-100">
                            <Card.Header className="bg-primary text-white">
                                <Card.Title className="d-flex align-items-center mb-0">
                                    <User className="me-2" size={16} />
                                    Personal Information
                                </Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="username">Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange("username", e.target.value)}
                                        placeholder="Enter username"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="fullName">Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                                        placeholder="Enter full name"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="role">Role in System</Form.Label>
                                    <Form.Select
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => handleInputChange("role", e.target.value)}
                                    >
                                        <option value="">Select role</option>
                                        <option value="admin">Administrator</option>
                                        <option value="enterprise_manager">Enterprise Manager</option>
                                        <option value="warehouse_manager">Warehouse Manager</option>
                                        <option value="staff">Staff</option>
                                        <option value="customer">Customer</option>
                                    </Form.Select>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Contact Information */}
                    <Col md={6}>
                        <Card className="h-100">
                            <Card.Header className="bg-success text-white">
                                <Card.Title className="d-flex align-items-center mb-0">
                                    <Mail className="me-2" size={16} />
                                    Contact Information
                                </Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="email">Email Address</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <Mail size={16} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            placeholder="Enter email address"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="phone">Contact Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="location">Location</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <MapPin size={16} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            placeholder="Enter your location (city, state, country)"
                                        />
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        {formData.location ? "Update your current location" : "Add your location"}
                                    </Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Enterprise Information - Conditional */}
                {showEnterpriseFields && (
                    <Row className="mt-4">
                        <Col>
                            <Card>
                                <Card.Header className="bg-warning text-dark">
                                    <Card.Title className="d-flex align-items-center mb-0">
                                        <Building className="me-2" size={16} />
                                        Enterprise Information
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="enterpriseName">Enterprise Name</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <Building size={16} />
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        id="enterpriseName"
                                                        value={formData.enterpriseName}
                                                        onChange={(e) => handleInputChange("enterpriseName", e.target.value)}
                                                        placeholder="Enter enterprise name"
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="warehouseName">Warehouse Name</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <Warehouse size={16} />
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        id="warehouseName"
                                                        value={formData.warehouseName}
                                                        onChange={(e) => handleInputChange("warehouseName", e.target.value)}
                                                        placeholder="Enter warehouse name"
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Action Buttons */}
                <Row className="mt-4">
                    <Col className="d-flex justify-content-end gap-2">
                        <Button variant="outline-secondary" type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}
