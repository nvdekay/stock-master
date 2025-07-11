import { Container, Row, Col } from "react-bootstrap"
import { Facebook, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-light text-dark py-4 mt-auto border-top">
      <Container>
        <Row>
          {/* Company Info */}
          <Col md={4} className="mb-3">
            <h5 className="text-primary fw-bold">StockMaster</h5>
            <p className="text-secondary">
              Your trusted partner for comprehensive warehouse management solutions. We provide efficient inventory
              tracking and logistics services.
            </p>
          </Col>

          {/* Contact Information */}
          <Col md={4} className="mb-3">
            <h6 className="fw-bold mb-3">Contact Information</h6>
            <div className="d-flex align-items-center mb-2">
              <Mail size={16} className="me-2 text-primary" />
              <a href="mailto:info@bizwarehouse.com" className="text-dark text-decoration-none">
                info@stockmaster.com
              </a>
            </div>
            <div className="d-flex align-items-center mb-2">
              <Phone size={16} className="me-2 text-primary" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="d-flex align-items-center">
              <MapPin size={16} className="me-2 text-primary" />
              <span>123 Warehouse St, Business City, BC 12345</span>
            </div>
          </Col>

          {/* Social Media & Links */}
          <Col md={4} className="mb-3">
            <h6 className="fw-bold mb-3">Follow Us</h6>
            <div className="d-flex align-items-center mb-3">
              <a
                href="https://facebook.com/bizwarehouse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark text-decoration-none d-flex align-items-center"
              >
                <Facebook size={20} className="me-2 text-primary" />
                Facebook
              </a>
            </div>
            <div>
              <h6 className="fw-bold mb-2">Quick Links</h6>
              <div className="d-flex flex-column">
                <a href="#about" className="text-secondary text-decoration-none mb-1">
                  About Us
                </a>
                <a href="#services" className="text-secondary text-decoration-none mb-1">
                  Services
                </a>
                <a href="#support" className="text-secondary text-decoration-none">
                  Support
                </a>
              </div>
            </div>
          </Col>
        </Row>

        <hr className="my-3 border-light" />

        {/* Copyright */}
        <Row>
          <Col className="text-center">
            <p className="text-secondary mb-0">&copy; {new Date().getFullYear()} BizWarehouse. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
