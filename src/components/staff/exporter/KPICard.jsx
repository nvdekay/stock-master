import {
  Card
} from "react-bootstrap"
import {
  ArrowUp,
  ArrowDown
} from "lucide-react"
const KPICard = ({ title, value, growth, icon: Icon, prefix = "", suffix = "", variant = "primary" }) => {
    const isPositive = growth > 0
    const GrowthIcon = isPositive ? ArrowUp : ArrowDown
    const growthColor = isPositive ? "success" : "danger"

    return (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 className="text-muted mb-2 fw-normal">{title}</h6>
                        <h3 className="mb-0 fw-bold">
                            {prefix}
                            {typeof value === "number" ? value.toLocaleString() : value}
                            {suffix}
                        </h3>
                    </div>
                    <div className={`text-${variant} bg-${variant} bg-opacity-10 p-2 rounded`}>
                        <Icon size={24} />
                    </div>
                </div>
                <div className="d-flex align-items-center mt-3">
                    <GrowthIcon size={16} className={`text-${growthColor} me-1`} />
                    <span className={`text-${growthColor} fw-semibold me-2`}>{Math.abs(growth)}%</span>
                    <span className="text-muted small">vs last month</span>
                </div>
            </Card.Body>
        </Card>
    )
}