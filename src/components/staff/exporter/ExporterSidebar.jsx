import {
    Nav,
    Badge,
} from "react-bootstrap"
import {
    Clock,
    CheckCircle,
    Calendar
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";

const ExporterSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathNames = location.pathname.split(["/"]);
    console.log(pathNames[pathNames.length - 1])
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        setActiveTab(pathNames[pathNames.length - 1] || "pending");
    }, [pathNames]);

    return (
        <div className="bg-white shadow-sm" style={{ minHeight: "calc(100vh - 56px)" }}>
            <div className="p-3 border-bottom">
                <h6 className="mb-0 text-muted">Exporter</h6>
            </div>
            <Nav className="flex-column">
                {/* <Nav.Item>
                    <Nav.Link
                        active={activeTab === "dashboard"}
                        onClick={() => {
                            setActiveTab("dashboard")
                            navigate("dashboard")
                        }}
                        className={`d-flex align-items-center gap-2 py-3 px-3 ${["dashboard", "exporter"].some(pathName => activeTab.includes(pathName)) ? "bg-primary text-white" : "text-dark"}`}
                        style={{ cursor: "pointer" }}
                    >
                        <Calendar size={18} />
                        <div className="flex-grow-1">
                            <div>Dashboard</div>
                        </div>
                    </Nav.Link>
                </Nav.Item> */}
                <Nav.Item>
                    <Nav.Link
                        active={activeTab === "pending"}
                        onClick={() => {
                            setActiveTab("pending")
                            navigate("pending-orders")
                        }} className={`d-flex align-items-center gap-2 py-3 px-3 ${["pending", "exporter"].some(pathName => activeTab.includes(pathName)) ? "bg-primary text-white" : "text-dark"}`}
                        style={{ cursor: "pointer" }}
                    >
                        <Clock size={18} />
                        <div className="flex-grow-1">
                            <div>Pending Orders</div>
                            {/* <small className={activeTab === "pending" ? "text-white-50" : "text-muted"}>
                                {mockPendingOrders.length} orders waiting
                            </small> */}
                        </div>
                        {/* <Badge
                            bg={activeTab === "pending" ? "light" : "warning"}
                            text={activeTab === "pending" ? "dark" : "white"}
                        >
                            {mockPendingOrders.length}
                        </Badge> */}
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        active={activeTab === "history"}
                        onClick={() => {
                            setActiveTab("history")
                            navigate("history")
                        }}
                        className={`d-flex align-items-center gap-2 py-3 px-3 ${activeTab.includes("history") ? "bg-primary text-white" : "text-dark"}`}
                        style={{ cursor: "pointer" }}
                    >
                        <CheckCircle size={18} />
                        <div className="flex-grow-1">
                            <div>Export History</div>
                            {/* <small className={activeTab === "history" ? "text-white-50" : "text-muted"}>
                            {mockExportHistory.length} completed orders
                        </small> */}
                        </div>
                        {/* <Badge
                        bg={activeTab === "history" ? "light" : "success"}
                        text={activeTab === "history" ? "dark" : "white"}
                    >
                        {mockExportHistory.length}
                    </Badge> */}
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    )
}

export default ExporterSidebar;