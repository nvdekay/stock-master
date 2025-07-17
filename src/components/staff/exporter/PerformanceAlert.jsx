import {
    Alert
} from "react-bootstrap"
import {
    Bell
} from "lucide-react"
const PerformanceAlert = ({ deliveredOrders }) => {
    return deliveredOrders === 0 ?
        <Alert variant="danger" className="mb-4">
            <Alert.Heading className="h6 mb-2">
                <Bell className="me-2" size={16} />
                Performance Summary
            </Alert.Heading>
            <p className="mb-0">
                You have <strong>NOT</strong> exported any order yet. Please start working <strong>NOW</strong>!
            </p>
        </Alert>

        : <Alert variant="info" className="mb-4">
            <Alert.Heading className="h6 mb-2">
                <Bell className="me-2" size={16} />
                Performance Summary
            </Alert.Heading>
            <p className="mb-0">
                You have successfully exported <strong>{deliveredOrders}</strong> order(s)
                . Keep up the excellent work!
            </p>
        </Alert>
}

export default PerformanceAlert;
