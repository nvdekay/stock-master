import { useState } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";
import { requestPasswordReset as resetPassword } from "../../api/api";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email, newPass);
      setDone(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center">
      <Card style={{ maxWidth: 400 }} className="w-100 mt-5 p-4">
        {done ? (
          <h4 className="text-center text-success">
            ✔️ Đổi mật khẩu thành công!
          </h4>
        ) : (
          <>
            <h3 className="text-center mb-4">Quên mật khẩu</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email đã đăng ký</Form.Label>
                <Form.Control
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="warning" type="submit" className="w-100">
                Đổi ngay
              </Button>
            </Form>
          </>
        )}
      </Card>
    </Container>
  );
}
