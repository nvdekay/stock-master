import { Container } from "react-bootstrap"
import Header from "../components/common/Header"
import { Outlet } from "react-router-dom"
import Footer from "../components/common/Footer"

export default function UserLayout() {
    return (
        <Container fluid className="p-0">
            <Header />
            <main className="">
                <Outlet />
            </main>
            <Footer />
        </Container>
    )
}