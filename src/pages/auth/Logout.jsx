import React from "react"
import { Modal, Button, Form } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/AuthProvider"

const LogoutPopup = ({ show, onHide }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout()
      onHide() // Close the modal
      navigate("/") // Redirect to home page
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onHide()
    }
  }

  // Add event listener for Esc key when modal is shown
  React.useEffect(() => {
    if (show) {
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [show])

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop={true} // Enables clicking outside to dismiss
      keyboard={true} // Enables Esc key to dismiss
      size="sm"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Logout</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label className="mb-3">Are you sure you want to log out of your account?</Form.Label>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="secondary" onClick={onHide} className="px-4">
          Cancel
        </Button>
        <Button variant="danger" onClick={handleLogout} className="px-4">
          Log Out
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default LogoutPopup
