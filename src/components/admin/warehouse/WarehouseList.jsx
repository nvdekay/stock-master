// src/components/admin/warehouse/WarehouseList.jsx
import React from 'react';
import { Table, Button, Alert, Card } from 'react-bootstrap';
import { Eye, Edit, Trash } from 'lucide-react';

const WarehouseList = ({ warehouses, enterprises, onEdit, onDelete, onViewDetail }) => {
    const getEnterpriseName = (enterpriseId) => {
        const enterprise = enterprises.find(e => e.id === enterpriseId);
        return enterprise ? enterprise.name : 'N/A';
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                {warehouses.length > 0 ? (
                    <Table striped bordered hover responsive className="mb-0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Warehouse Name</th> 
                                <th>Location</th> 
                                <th>Enterprise</th> 
                                <th className="text-center">Action</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map(warehouse => (
                                <tr key={warehouse.id}>
                                    <td>{warehouse.id}</td>
                                    <td>{warehouse.name}</td>
                                    <td>{warehouse.location}</td>
                                    <td>{getEnterpriseName(warehouse.enterpriseId)}</td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center">
                                            <Button variant="outline-success"
                                                size="sm"
                                                className="me-2 d-flex align-items-center rounded-pill"
                                                onClick={() => onViewDetail(warehouse)}>
                                                <Eye size={16} className="me-1" /> View Detail 
                                            </Button>
                                            <Button variant="outline-primary"
                                                size="sm"
                                                className="me-2 d-flex align-items-center rounded-pill"
                                                onClick={() => onEdit(warehouse)}>
                                                <Edit size={16} className="me-1" /> Edit 
                                            </Button>
                                            <Button variant="outline-danger"
                                                size="sm"
                                                className="d-flex align-items-center rounded-pill"
                                                onClick={() => onDelete(warehouse.id)}>
                                                <Trash size={16} className="me-1" /> Delete 
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Alert variant="info" className="mb-0 text-center">
                        No warehouses found matching the search/filter criteria. 
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default WarehouseList;