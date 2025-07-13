import { Navbar, Nav, Dropdown, Container, Button } from "react-bootstrap"
import { LogOut, ShoppingCart, User } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import CartButton from "../cart/CartButton"
import LogoutPopup from "../../pages/auth/Logout"

const Header = () => {
    const { user, loading } = useAuth();
    // log out modal
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleShowLogout = () => setShowLogoutModal(true)
    const handleHideLogout = () => setShowLogoutModal(false)


    // console.log(user)

    if (loading) return <div className="text-center">Loading</div>;

    return (
        <Navbar bg="light" variant="light" className="shadow-sm border-bottom">
            <Container fluid>
                {/* Company Name */}
                <Navbar.Brand href="#" className="fw-bold fs-3 text-primary">
                    StockMaster
                </Navbar.Brand>

                {/* Right side items */}
                <Nav className="ms-auto d-flex align-items-center">
                    {/* Cart Icon */}
                    { user ? 
                        user.role.toLowerCase().includes("buyer") ?
                            <CartButton />
                            : ""
                        : ""
                    }


                    {/* User Dropdown */}
                    <Dropdown align="end">
                        {user ?
                            <Dropdown.Toggle variant="outline-dark" id="user-dropdown" className="d-flex align-items-center border-0">
                                <User size={20} className="me-2" />
                                {user.username}
                            </Dropdown.Toggle>
                            :
                            <Button href="/auth/login">Login</Button>
                        }

                        <Dropdown.Menu className="shadow">
                            <Dropdown.Item href="#profile">
                                <User size={16} className="me-2" />
                                View Profile
                            </Dropdown.Item>
                            <Dropdown.Item href="#orders">
                                <ShoppingCart size={16} className="me-2" />
                                View Order History
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                                href="#"
                                className="d-flex align-items-center gap-2 text-danger"
                                onClick={() => setShowLogoutModal(!showLogoutModal)}
                            >
                                <LogOut size={16} /> Sign out
                            </Dropdown.Item>

                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>

                <LogoutPopup show={showLogoutModal} onHide={handleHideLogout} />
            </Container>
        </Navbar>
    )
}

export default Header
