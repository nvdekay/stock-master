import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
    const { user, logout } = useAuth();

    return (
        <Navbar bg="dark" variant="dark" expand="sm" className="mb-4">
            <Container>
                <Navbar.Brand href="/">Stock Master</Navbar.Brand>
                {user && (
                    <>
                        <Nav className="me-auto">
                            {user.role === 'admin' && <Nav.Link href="/admin">Admin</Nav.Link>}
                        </Nav>
                        <Button size="sm" variant="outline-light" onClick={logout}>
                            Đăng xuất
                        </Button>
                    </>
                )}
            </Container>
        </Navbar>
    );
}
