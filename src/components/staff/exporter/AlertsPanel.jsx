import {
  Card,
  Badge,
  Alert
} from "react-bootstrap"
import {
  CheckCircle,
  AlertTriangle,
  Bell
} from "lucide-react"

const AlertsPanel = ({ alerts }) => {
    const getAlertVariant = (type) => {
        switch (type) {
            case "warning":
                return "warning"
            case "success":
                return "success"
            case "info":
                return "info"
            case "danger":
                return "danger"
            default:
                return "secondary"
        }
    }

    const getAlertIcon = (type) => {
        switch (type) {
            case "warning":
                return <AlertTriangle size={16} />
            case "success":
                return <CheckCircle size={16} />
            case "info":
                return <Bell size={16} />
            default:
                return <Bell size={16} />
        }
    }

    return (
        <Card className="h-100">
            <Card.Header className="bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">Recent Alerts</h6>
                    <Badge bg="danger" className="rounded-pill">
                        {alerts.length}
                    </Badge>
                </div>
            </Card.Header>
            <Card.Body className="p-0">
                {alerts.map((alert, index) => (
                    <Alert key={index} variant={getAlertVariant(alert.type)} className="mb-0 rounded-0 border-0 border-bottom">
                        <div className="d-flex align-items-start">
                            <div className="me-3 mt-1">{getAlertIcon(alert.type)}</div>
                            <div className="flex-grow-1">
                                <Alert.Heading className="h6 mb-1">{alert.title}</Alert.Heading>
                                <p className="mb-1 small">{alert.message}</p>
                                <small className="text-muted">{alert.time}</small>
                            </div>
                        </div>
                    </Alert>
                ))}
            </Card.Body>
        </Card>
    )
}

export default AlertsPanel;