import {
    ArrowLeft,
    Package,
    MapPin,
    Calendar,
    FileText,
    Truck,
    CheckCircle,
    Clock,
    User,
    Warehouse,
    UserPen,
    Bell,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../../api/axiosInstance"
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Row, Table } from "react-bootstrap"
import FormatCurrency from "../../../components/common/FormatCurrency"
import { useAuth } from "../../../auth/AuthProvider"
import { BiLeftArrow } from "react-icons/bi"
import { getStatusBadgeClass } from "../../../components/common/StatusStyling"

const OrderDetails = () => {
    const [productList, setProductList] = useState([]);
    const [orderData, setOrderData] = useState(null);

    const [updateMessage, setUpdateMessage] = useState('');
    const [variant, setVariant] = useState();

    const { user, loading } = useAuth();
    const { orderId } = useParams();
    const navigate = useNavigate();
    console.log("orderId from params: ", orderId)

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top when component mounts
    }, []);

    useEffect(() => {
        if (!orderId) return;
        const fetchOrderDetails = async () => {
            console.log('fetching')
            try {
                const exportOrderRes = await api.get(`http://localhost:9999/orders/${orderId}?_embed=orderDetails`);
                const order = exportOrderRes.data;
                console.log("order: ", exportOrderRes.data)
                if (order.buyerId) {
                    const buyerRes = await api.get(`http://localhost:9999/users/${order.buyerId}`)
                    const locationRes = await api.get(`http://localhost:9999/locations?userId=${order.buyerId}`)
                    const buyer = buyerRes.data;
                    order.customer = buyer.username;
                    order.destination = locationRes.data.location;
                }
                if (order.receiveWarehouseId) {
                    const receiveWarehouseRes = await api.get(`http://localhost:9999/warehouses/${order.receiveWarehouseId}`)
                    const receiverWarehouse = receiveWarehouseRes.data;
                    order.customer = receiverWarehouse.name;
                    order.destination = receiverWarehouse.location;
                }
                setOrderData({
                    ...order,
                    value: order.orderDetails.reduce((total, product) => total + product.price, 0),
                    items: order.orderDetails.length
                })

            } catch (err) {
                console.log("error fetching order details: ", err);
            }
        }
        fetchOrderDetails();
    }, [orderId, updateMessage]);

    useEffect(() => {
        if (!orderData) return;
        const fetchProductList = async () => {
            try {
                const pList = [];
                orderData.orderDetails.map(async (product) => {
                    const p = await api.get(`http://localhost:9999/products/${product.productId}`)
                    pList.push(p?.data);
                })
                console.log("pLIst: ", pList)
                setProductList(pList);
            } catch (err) {
                console.log("error fetching product list: ", err);
            }
        };
        fetchProductList();
    }, [orderData, updateMessage])

    const handleExport = async (orderStatus) => {
        try {

            if (orderStatus.includes("ready")) {
                await Promise.all(
                    orderData.orderDetails.map(async (item) => {
                        const productRes = await api.get(`http://localhost:9999/products/${item.productId}`);
                        const product = productRes.data;

                        const updatedStock = product.quantity - item.quantity;
                        if (updatedStock < 0) {
                            throw new Error(`Not enough stock for ${product.name}`);
                        }

                        await api.patch(`http://localhost:9999/products/${item.productId}`, {
                            stock: updatedStock,
                        });
                    })
                );
            }
            await api.patch(`http://localhost:9999/orders/${orderData.id}`, {
                status: orderStatus,
                senderStaffId: user.id
            })
            setUpdateMessage('Order updated successfully')
            setVariant("success")
        } catch (err) {
            console.log("error updating status: ", err)
            setUpdateMessage(err.status)
            setVariant("danger")
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Not yet"
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (loading || !orderData) return <div className="text-center">Loading data...</div>

    console.log("productList: ", productList)
    return (
        <Container fluid className="py-4 px-0" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} >
            <Container className="px-0">
                {/* Header */}
                <Row className="mb-4">
                    <Col className="col-12">
                        <div className="d-flex align-items-center mb-3">
                            <button
                                className="btn btn-outline-secondary me-3"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="h3 mb-0">Order Details</h1>

                        </div>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col md={8}>
                                        <h2 className="h4 mb-2">Order #{orderData?.id}</h2>
                                        <div className="d-flex flex-wrap gap-3">
                                            <Badge bg={getStatusBadgeClass(orderData.status)} className={`fs-6`}>{orderData?.status}</Badge>
                                            <span className="badge bg-light text-dark fs-6">
                                                {orderData.type === "transfer" ? "Transfer" : "Wholesale"}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col md={4} className="text-md-end mt-3 mt-md-0">
                                        <div className="h5 mb-0 text-primary"><FormatCurrency amount={orderData.value} /></div>
                                        <small className="text-muted">{orderData.items} items</small>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    {/* Order Information */}
                    <Col lg={8} className="mb-4">
                        {/* Basic Information */}
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="bg-white">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FileText size={20} className="me-2" />
                                    Order Information
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <label className="form-label text-muted">Created Date</label>
                                        <div className="d-flex align-items-center">
                                            <Calendar size={16} className="me-2 text-muted" />
                                            <span>{formatDate(orderData.date)}</span>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <label className="form-label text-muted">Expected Delivery</label>
                                        <div className="d-flex align-items-center">
                                            <Truck size={16} className="me-2 text-muted" />
                                            <span>{formatDate(orderData.expectedDeliveryDate)}</span>
                                        </div>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <label className="form-label text-muted">Completed Date</label>
                                        <div className="d-flex align-items-center">
                                            {orderData.completedDate ? (
                                                <CheckCircle size={16} className="me-2 text-success" />
                                            ) : (
                                                <Clock size={16} className="me-2 text-muted" />
                                            )}
                                            <span>{formatDate(orderData.completedDate)}</span>
                                        </div>
                                    </Col>
                                    <Col className="col-12">
                                        <label className="form-label text-muted">Note</label>
                                        <p className="mb-0">{orderData.note || "No additional notes"}</p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Destination Information */}
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="bg-white">
                                <h5 className="mb-0 d-flex align-items-center">
                                    {orderData.type === "transfer" ? (
                                        <>
                                            <Warehouse size={20} className="me-2" />
                                            Destination Warehouse
                                        </>
                                    ) : (
                                        <>
                                            <User size={20} className="me-2" />
                                            Customer Information
                                        </>
                                    )}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <h6 className="mb-2">{orderData.customer}</h6>
                                <div className="d-flex align-items-start">
                                    <MapPin size={16} className="me-2 text-muted mt-1" />
                                    <span className="text-muted">{orderData.destination}</span>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Products List */}
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <Package size={20} className="me-2" />
                                    Products ({orderData.orderDetails.length})
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-center">Product</th>
                                                <th className="text-center">Quantity</th>

                                                {
                                                    orderData.status.includes("pending") ?
                                                        <th className="text-center">Available in Stock</th>
                                                        : ""
                                                }
                                                <th className="text-end">Unit Price</th>
                                                <th className="text-end">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderData.orderDetails.map((product) => {
                                                let p = productList?.find(p => p.id === product.productId);
                                                return (
                                                    <tr key={product.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={p.src || `../../public/assets/images/products/${product.id}.jpg`} // Sử dụng src từ database
                                                                    alt={product.name}
                                                                    className="rounded me-3"
                                                                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-0">{product.name}</h6>
                                                                    <small className="text-muted">ID: {product.productId}</small><br />
                                                                    <small className="text-muted">{p?.name}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <span className="badge bg-info text-light">{product.quantity}</span>
                                                        </td>
                                                        {
                                                            orderData.status.includes("pending") ?
                                                                <td className="text-center align-middle">
                                                                    <span className="badge bg-success text-light">{p?.quantity}</span>
                                                                </td>
                                                                : ""
                                                        }
                                                        <td className="text-end align-middle"><FormatCurrency amount={p?.price} /></td>
                                                        <td className="text-end align-middle fw-bold"><FormatCurrency amount={product.price} /></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Order Summary */}
                    <Col lg={4}>
                        <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
                            <Card.Header className="bg-white">
                                <h5 className="mb-0">Order Summary</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Total Items:</span>
                                    <span className="fw-bold">{orderData.items}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Subtotal:</span>
                                    <span><FormatCurrency amount={orderData.value} /></span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Shipping Fee:</span>
                                    <span className="text-success">Free</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="h6">Total Amount:</span>
                                    <span className="h5 text-primary fw-bold"><FormatCurrency amount={orderData.value} /></span>
                                </div>

                                <div className="mt-4">
                                    <h6 className="mb-3">Order Status</h6>
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="bg-success rounded-circle me-3" style={{ width: "12px", height: "12px" }}></div>
                                        <small>Order Created</small>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <div
                                            className={`${["shipped", "completed", "ready"].some(status => orderData.status.includes(status)) || orderData.completedDate ? "bg-success" : "bg-light"} rounded-circle me-3`}
                                            style={{ width: "12px", height: "12px" }}
                                        ></div>
                                        <small>Ready</small>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <div
                                            className={`${["shipped", "completed"].some(status => orderData.status.includes(status)) || orderData.completedDate ? "bg-success" : "bg-light"} rounded-circle me-3`}
                                            style={{ width: "12px", height: "12px" }}
                                        ></div>
                                        <small>In Transit</small>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <div
                                            className={`${["shipped", "completed"].some(status => orderData.status.includes(status)) ? "bg-success" : "bg-light"} rounded-circle me-3`}
                                            style={{ width: "12px", height: "12px" }}
                                        ></div>
                                        <small>Shipped</small>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <div
                                            className={`${["completed"].some(status => orderData.status.includes(status)) ? "bg-success" : "bg-light"} rounded-circle me-3`}
                                            style={{ width: "12px", height: "12px" }}
                                        ></div>
                                        <small>Completed</small>
                                    </div>
                                </div>
                                {
                                    orderData.status.includes("pending") ?
                                        <ButtonGroup className="d-flex">
                                            <Button
                                                variant="success"
                                                onClick={() => handleExport("ready")}
                                            >
                                                Export
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleExport("declined")}
                                            >
                                                Decline
                                            </Button>

                                        </ButtonGroup>
                                        : ""
                                }
                                {updateMessage &&
                                    <Alert variant={variant} className="mt-3">
                                        <Alert.Heading className="h6 mb-2">
                                            <Bell className="me-2" size={16} />
                                            Update Message
                                        </Alert.Heading>
                                        <p className="mb-0">
                                            {updateMessage}
                                        </p>
                                    </Alert>
                                }
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Container>
    )
}

export default OrderDetails
