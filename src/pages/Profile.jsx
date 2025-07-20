import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from "react-bootstrap"
import { User, Mail, MapPin, Building, Warehouse } from "lucide-react"
import { useAuth } from "../auth/AuthProvider"
import api from "../api/axiosInstance"

export default function UserProfile() {
    const { user, login } = useAuth();

    const [formData, setFormData] = useState(user)
    const [enterprise, setEnterprise] = useState();
    const [warehouse, setWarehouse] = useState();
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertVariant, setAlertVariant] = useState("danger");



    useEffect(() => {
        const fetchStaffData = async () => {
            if (user.warehouseId !== null && user.enterpriseId !== null) {
                try {
                    const [warehouseRes, enterpriseRes, locationRes] = await Promise.all([
                        api.get(`http://localhost:9999/warehouses/${user.warehouseId}`),
                        api.get(`http://localhost:9999/enterprises/${user.enterpriseId}`),
                        api.get(`http://localhost:9999/locations?userId=${user.id}`)
                    ])

                    setWarehouse(warehouseRes.data);
                    setEnterprise(enterpriseRes.data);
                    // console.log("locationRes.data.location: ", locationRes.data)
                    setFormData({
                        ...formData,
                        enterpriseName: enterpriseRes.data.name,
                        warehouseName: warehouseRes.data.name,
                        warehouseLocation: warehouseRes.data.location,
                        location: locationRes.data[0].location
                    })
                } catch (err) {
                    console.log("error fetching staff data: ", err)
                }
            }

        }
        fetchStaffData();
    }, [])

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const showEnterpriseFields = ["staff", "warehouseman", "manager", "exporter"].includes(formData.role)

    const handleSubmit = async (e) => {
        e.preventDefault()
        // console.log("Form submitted:", formData)

        try {
            const updateBody = {
                username: formData.username,
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email
            }
            const updateRes = await api.patch(`/users/${user.id}`, updateBody)
            const getLocationByUserId = await api.get(`/locations?userId=${user.id}`)
            const locations = getLocationByUserId.data;
            // console.log("getLocation: ", locations)

            // console.log(updateRes)
            if (getLocationByUserId.length === 0) {
                const addNewLocationRes = await api.post(`/locations`, {
                    userId: formData.id,
                    location: formData.location
                })
                // console.log("add new location: ", addNewLocationRes.data)
            } else {
                const locationId = locations[0].id;
                const locationUpdateRes = await api.patch(`/locations/${locationId}`, {
                    location: formData.location
                })
                // console.log("update location: ", locationUpdateRes.data)
            }
            if (updateRes.status === 200) {
                const tokenString = localStorage.getItem("token");
                // console.log(tokenString)

                login(updateRes.data, tokenString);

                setTimeout(() => {
                    setAlertMessage("Your profile is updated successfully")
                    setAlertVariant("success")
                    setShowAlert(true)

                }, 5000)
                setShowAlert(false)
            }

        } catch (err) {
            console.log("error patching data: ", err)
        }

    }

    return (
        <Container className="py-4">
            <div className="mb-4">
                <h1 className="display-5 fw-bold">User Profile</h1>
                <p className="text-muted">Manage your account information and preferences</p>
                <p className="text-muted">Fields mark by a red <span className="text-danger">*</span> is required</p>
            </div>
            {showAlert && (
                <Alert
                    variant={alertVariant}
                    dismissible
                    onClose={() => setShowAlert(false)}
                >
                    {alertMessage}
                </Alert>
            )}

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
                                    <Form.Label htmlFor="username">Username{' '}<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange("username", e.target.value)}
                                        placeholder="Enter username"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="fullName">Full Name{' '}<span className="text-danger">*</span></Form.Label>
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
                                    <Form.Control
                                        type="text"
                                        value={formData.role}
                                        readOnly
                                    >
                                    </Form.Control>
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
                                    <Form.Label htmlFor="email">Email Address{' '}<span className="text-danger">*</span></Form.Label>
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
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="phone">Contact Phone{' '}<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="location">Location{' '}<span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <MapPin size={16} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            placeholder="Enter your location (city, state, country)"
                                            required
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
                                                        readOnly
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
                                                        readOnly
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label htmlFor="location">Location</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <MapPin size={16} />
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        id="location"
                                                        value={formData.warehouseLocation}
                                                        readOnly
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
