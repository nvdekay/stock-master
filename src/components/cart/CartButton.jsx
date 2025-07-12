import { Nav } from "react-bootstrap"
import { ShoppingCart } from "lucide-react"

export default function CartButton() {
    return (
        <Nav.Link href="#" className="me-3 position-relative">
            <ShoppingCart size={24} className="text-dark" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3<span className="visually-hidden">items in cart</span>
            </span>
        </Nav.Link>
    )
}