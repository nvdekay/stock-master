import { Modal, Button, Spinner } from 'react-bootstrap';
import { AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';

const DeleteAccountModal = ({ user, isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:9999/users/${user.id}`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to delete user:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <AlertTriangle className="text-danger" size={20} />
                    Delete Account
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this account?</p>
                <div className="border rounded p-3 mb-3 bg-light">
                    <div><strong>{user.fullName}</strong></div>
                    <div className="text-muted">{user.email}</div>
                    <div className="text-muted">@{user.username}</div>
                </div>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    This action will permanently delete the account from the system.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    <X size={16} className="me-2" />
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirm} disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Deleting...
                        </>
                    ) : (
                        <>Delete Account</>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteAccountModal;
