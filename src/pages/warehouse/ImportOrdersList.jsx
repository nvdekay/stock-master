import { useEffect, useState } from "react";
import { Container, Table, Alert } from "react-bootstrap";
import axios from "axios";
// import "../../public/assets/css/ImportOrdersList.css";

function ImportOrdersList() {
  const [importOrders, setImportOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "danger" });

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:9999/importOrders"),
      axios.get("http://localhost:9999/orderDetails?orderType=import"),
      axios.get("http://localhost:9999/products"),
      axios.get("http://localhost:9999/warehouses"),
    ])
      .then(([ordersRes, detailsRes, productsRes, warehousesRes]) => {
        console.log("Import Orders:", ordersRes.data);
        console.log("Order Details:", detailsRes.data);
        console.log("Products:", productsRes.data);
        console.log("Warehouses:", warehousesRes.data);
        setImportOrders(ordersRes.data);
        setOrderDetails(detailsRes.data);
        setProducts(productsRes.data);
        setWarehouses(warehousesRes.data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setAlert({ show: true, message: `Lỗi khi fetch danh sách nhập: ${err.message}`, variant: "danger" });
      });
  }, []);

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Không rõ";
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse ? warehouse.name : "Không rõ";
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📋 Danh sách phiếu nhập</h2>
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Staff ID</th>
            <th>Kho</th>
            <th>Ngày</th>
            <th>Ghi chú</th>
            <th>Sản phẩm</th>
          </tr>
        </thead>
        <tbody>
          {importOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.staffId}</td>
              <td>{getWarehouseName(order.warehouseId)}</td>
              <td>{order.date}</td>
              <td>{order.note || "-"}</td>
              <td>
                <ul>
                  {orderDetails
                    .filter((detail) => detail.orderId === order.id && detail.orderType === "import")
                    .map((detail) => (
                      <li key={detail.id}>
                        {getProductName(detail.productId)}: {detail.quantity}
                      </li>
                    ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ImportOrdersList;