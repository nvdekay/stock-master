import { CheckCircle, Clock, Package, XCircle } from "lucide-react"

const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
        case "completed":
            return "success"
        case "in_transit":
            return "primary"
        case "pending":
            return "warning"
        case "cancelled":
        case "declined":
            return "danger"
        case "shipped":
            return "info"
        case "ready":
            return "success"
        default:
            return "secondary"
    }
}
const getStatusIcon = (status) => {
    switch (status) {
        case "completed":
            return <CheckCircle size={16} />
        case "in_transit":
            return <Clock size={16} />
        case "Cancelled":
            return <XCircle size={16} />
        default:
            return <Package size={16} />
    }
}

export { getStatusBadgeClass, getStatusIcon }