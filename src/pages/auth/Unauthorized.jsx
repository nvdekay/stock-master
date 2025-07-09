import { useState, useEffect } from "react"
import { Container, Card, Alert, Spinner, ProgressBar } from "react-bootstrap"
import { useNavigate } from "react-router-dom"

const RedirectPage = ({
    // default message, page name and url to be redirected
    message = "You must be logged in to view this page",
    pageName = "Login Page",
    redirectUrl = "/login",
}) => {

    // set total count down seconds
    const countDownSeconds = 5

    const [countdown, setCountdown] = useState(countDownSeconds)
    const navigate = useNavigate()

    useEffect(() => {
        // Create interval to update countdown every second
        const countdownInterval = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 0) {
                    clearInterval(countdownInterval)
                    return 0
                }
                return prevCount - 1
            })
        }, 1000)

        // Set timeout to redirect after x seconds
        const redirectTimeout = setTimeout(() => {
            navigate(redirectUrl)
        }, countDownSeconds * 1000)

        // Cleanup function to clear intervals and timeouts
        return () => {
            clearInterval(countdownInterval)
            clearTimeout(redirectTimeout)
        }
    }, [navigate, redirectUrl])

    // Calculate progress percentage for progress bar
    const progressPercentage = ((countDownSeconds - countdown) / countDownSeconds) * 100

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card className="text-center shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
                <Card.Header className="bg-warning text-dark">
                    <h4 className="mb-0">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Access Restricted
                    </h4>
                </Card.Header>

                <Card.Body className="p-4">
                    <Alert variant="warning" className="mb-4">
                        <Alert.Heading className="h6">{message}</Alert.Heading>
                        {/* <Alert.Heading className="h5">Authentication Required</Alert.Heading>
                        <p className="mb-0">{message}</p> */}
                    </Alert>

                    <div className="mb-4">
                        <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                        <span className="text-muted">Redirecting you to the</span>
                        <strong className="text-primary ms-1">{pageName}</strong>
                    </div>

                    <div className="mb-3">
                        <h2 className="display-4 text-primary mb-2">{countdown}</h2>
                        <p className="text-muted mb-3">{countdown === 1 ? "second" : "seconds"} remaining</p>

                        <ProgressBar
                            now={progressPercentage}
                            variant="primary"
                            animated
                            className="mb-3"
                            style={{ height: "8px" }}
                        />
                    </div>

                    <small className="text-muted">
                        You will be automatically redirected to <strong>{pageName}</strong>
                    </small>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default RedirectPage
