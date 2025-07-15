import { useState } from "react";
import ExporterSidebar from "../components/staff/exporter/ExporterSidebar";
import ExportHistory from "../pages/staff/exporter/ExportHistory";
import PendingOrders from "../pages/staff/exporter/PendingOrders";
import {
    Container,
    Row,
    Col,
    Nav,
    Badge,
    Offcanvas,
} from "react-bootstrap"
import {
    Clock,
    CheckCircle,
} from "lucide-react"
import { Outlet } from "react-router-dom";


const ExporterLayout = () => {
    // const [activeTab, setActiveTab] = useState("pending")
    // const [showSidebar, setShowSidebar] = useState(true);
    return (
        <div className="min-vh-100 bg-light">
            <Container fluid>
                <Row>
                    <Col lg={3} xl={2} className="d-none d-lg-block p-0">
                        <ExporterSidebar  />
                    </Col>
                    {/* <Row>
                    <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="start">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Navigation</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="p-0">
                            <Nav className="flex-column">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === "pending"}
                                        onClick={() => {
                                            setActiveTab("pending")
                                            setShowSidebar(false)
                                        }}
                                        className={`d-flex align-items-center gap-2 py-3 px-3 ${activeTab === "pending" ? "bg-primary text-white" : "text-dark"}`}
                                    >
                                        <Clock size={18} />
                                        <div className="flex-grow-1">
                                            <div>Pending Orders</div>
                                            <small className={activeTab === "pending" ? "text-white-50" : "text-muted"}>
                                                {mockPendingOrders.length} orders waiting
                                            </small>
                                        </div>
                                        <Badge
                                            bg={activeTab === "pending" ? "light" : "warning"}
                                            text={activeTab === "pending" ? "dark" : "white"}
                                        >
                                            {mockPendingOrders.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === "history"}
                                        onClick={() => {
                                            setActiveTab("history")
                                            setShowSidebar(false)
                                        }}
                                        className={`d-flex align-items-center gap-2 py-3 px-3 ${activeTab === "history" ? "bg-primary text-white" : "text-dark"}`}
                                    >
                                        <CheckCircle size={18} />
                                        <div className="flex-grow-1">
                                            <div>Export History</div>
                                            <small className={activeTab === "history" ? "text-white-50" : "text-muted"}>
                                                {mockExportHistory.length} completed orders
                                            </small>
                                        </div>
                                        <Badge
                                            bg={activeTab === "history" ? "light" : "success"}
                                            text={activeTab === "history" ? "dark" : "white"}
                                        >
                                            {mockExportHistory.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Offcanvas.Body>
                    </Offcanvas>
 */}
                    <Col lg={9} xl={10} className="py-4">
                        {/* {activeTab === "pending" && <PendingOrders />}
                            {activeTab === "history" && <ExportHistory />} */}
                        <Outlet />
                    </Col>
                </Row>

            </Container>
        </div >
    )
}

export default ExporterLayout;