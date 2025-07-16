import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "../../auth/AuthProvider";
import api from "../../api/axiosInstance";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLoading(true);

        if (!user?.warehouseId) {
          setError("No warehouse assigned to your account");
          setLoading(false);
          return;
        }

        const ordersRes = await api.get("/orders", {
          params: {
            receiveWarehouseId: user.warehouseId,
            type: "import",
          },
        });
        const orderIds = ordersRes.data.map((order) => order.id);

        const logsRes = await api.get("/logs", {
          params: {
            warehouseId: currentUser.warehouseId,
            _sort: "timestamp",
            _order: "desc",
            _limit: 100,
          },
        });

        const filteredLogs = logsRes.data.filter(
          (log) =>
            log.userId === user.id ||
            (log.action.includes("Import order") &&
              orderIds.some((id) => log.action.includes(`#${id}`)))
        );

        setLogs(filteredLogs);

        const userIds = [...new Set(filteredLogs.map((log) => log.userId))];
        const userDetailsPromises = userIds.map((userId) =>
          api.get(`/users/${userId}`)
        );

        const userResponses = await Promise.all(userDetailsPromises);

        // Create a map of userId to user details
        const usersMap = {};
        userResponses.forEach((response) => {
          const user = response.data;
          usersMap[user.id] = user;
        });

        setUsers(usersMap);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching activity logs", err);
        setError("Could not load activity logs");
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [user]);

  // Filter logs based on search term
  const filteredLogs = logs.filter(
    (log) =>
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (users[log.userId]?.username &&
        users[log.userId].username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (users[log.userId]?.fullName &&
        users[log.userId].fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const getActionBadge = (action) => {
    if (action.includes("logged in")) {
      return <Badge bg="primary">Login</Badge>;
    } else if (action.includes("Import order")) {
      return <Badge bg="success">Import Processed</Badge>;
    }
    return <Badge bg="secondary">{action}</Badge>;
  };

  return (
    <Container className="my-4">
      <h1>Activity Logs</h1>

      <Card>
        <Card.Body>
          <div className="mb-3">
            <InputGroup style={{ maxWidth: "400px" }}>
              <InputGroup.Text id="search-addon">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search logs by action or user"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <FaCalendarAlt className="me-1" />
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      {users[log.userId]?.fullName ||
                        users[log.userId]?.username ||
                        "Unknown User"}
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ActivityLogs;
