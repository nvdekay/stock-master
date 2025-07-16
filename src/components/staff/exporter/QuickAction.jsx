import {
    Card,
    Button,
} from "react-bootstrap"
import {
    Users,
    Download,
    Plus,
    BarChart3,
    Truck,
} from "lucide-react"
const QuickActions = () => {
    return (
        <Card className="h-100">
            <Card.Header className="bg-white border-bottom">
                <h6 className="mb-0 fw-semibold">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
                <div className="d-grid gap-2">
                    <Button variant="outline-success" className="d-flex align-items-center justify-content-center">
                        <Download size={16} className="me-2" />
                        Generate Report
                    </Button>
                    <Button variant="outline-info" className="d-flex align-items-center justify-content-center">
                        <BarChart3 size={16} className="me-2" />
                        View Analytics
                    </Button>
                    <Button variant="outline-warning" className="d-flex align-items-center justify-content-center">
                        <Truck size={16} className="me-2" />
                        Track Shipments
                    </Button>
                    {/* <Button variant="outline-secondary" className="d-flex align-items-center justify-content-center">
                        <Users size={16} className="me-2" />
                        Manage Customers
                    </Button> */}
                </div>
            </Card.Body>
        </Card>
    )
}

export default QuickActions;