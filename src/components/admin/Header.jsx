import { useState } from 'react';
import {
    Bell,
    Settings,
    User,
    LogOut,
} from 'lucide-react';
import {
    Navbar,
    Button,
    Dropdown,
} from 'react-bootstrap';
import LogoutPopup from '../../pages/auth/Logout';

const Header = () => {
    // log out modal
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const handleHideLogout = () => setShowLogoutModal(false)

    const getInitials = (name) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();

    return (
        <Navbar
            bg="white"
            expand="lg"
            className="border-bottom sticky-top px-3"
            style={{ height: '64px', zIndex: 1030 }}
        >
            {/* Brand */}
            <Navbar.Brand href="#" className="d-flex align-items-center gap-3">
                <div
                    className="d-flex align-items-center justify-content-center rounded"
                    style={{
                        width: 32,
                        height: 32,
                        backgroundColor: '#1E88E5',
                    }}
                >
                    <span className="fw-bold text-white small">SM</span>
                </div>
                <span className="fw-bold fs-4 text-dark mb-0">StockMaster</span>
            </Navbar.Brand>

            {/* Right section */}
            <div className="d-flex align-items-center gap-3 ms-auto">

                {/* User dropdown */}
                <Dropdown align="end">
                    <Dropdown.Toggle
                        as={Button}
                        variant="link"
                        className="d-flex align-items-center gap-2 p-2 text-decoration-none text-dark"
                    >
                        <div
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                                width: 32,
                                height: 32,
                                backgroundColor: '#1E88E5',
                            }}
                        >
                            <span className="text-white small fw-medium">
                                {getInitials('Admin User')}
                            </span>
                        </div>
                        <div className="d-none d-sm-block text-start">
                            <div className="fw-medium small">Admin</div>
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow-sm">
                        <Dropdown.Item href="#" className="d-flex align-items-center gap-2">
                            <User size={16} /> Profile
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
            </div>
            <LogoutPopup show={showLogoutModal} onHide={handleHideLogout} />
        </Navbar>
    );
};

export default Header;
