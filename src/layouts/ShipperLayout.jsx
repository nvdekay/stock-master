import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

const ShipperLayout = () => (
    <>
        <Container fluid>
            <Row>
                <Col md={2} className="bg-light p-3">
                    <Nav className="flex-column">
                        <Nav.Link href="/shipper">Assigned Shipments</Nav.Link>
                        <Nav.Link href="/shipper/completed">Completed Deliveries</Nav.Link>
                    </Nav>
                </Col>
                <Col md={10}>
                    <Outlet />
                </Col>
            </Row>
        </Container>
    </>
);

export default ShipperLayout;