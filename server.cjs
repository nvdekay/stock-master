const jsonServer = require("json-server");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = jsonServer.create();
const router = jsonServer.router("database.json");

app.db = router.db;

app.use(cors());
app.use(jsonServer.bodyParser);

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded; // Save decoded payload (e.g., { id, email }) for later use
    next();
  });
}

// Auth middleware with JWT
app.use((req, res, next) => {
  const publicPaths = [
    // public backend request
    "/login",
    "/register",
    "/products",
    "/product_types",
  ];
  const isPublicRoute = publicPaths.includes(req.path);

  if (isPublicRoute) {
    return next();
  }

  authenticateToken(req, res, next);
});

// Custom login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!password || !username) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // Try to find by email or username
  const user = app.db
    .get("users")
    .find((u) => username && (u.email === username || u.username === username))
    .value();

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ error: "Incorrect password" });
  }

  // Create a token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    "your-secret-key",
    { expiresIn: "1h" }
  );

  const userInfo = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    enterpriseId: user.enterpriseId || null,
    warehouseId: user.warehouseId || null,
    fullName: user.fullName || null,
  };

  res.json({
    accessToken: token,
    user: userInfo,
  });
});

app.post("/register", (req, res) => {
  const { email, username, password, role, fullName } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Check if email or username already exists
  let exist = "";
  const existingUser = app.db
    .get("users")
    .find((u) => {
      if (u.email === email) {
        exist = "email";
        return true;
      }
      if (u.username === username) {
        exist = "username";
        return true;
      }
    })
    .value();

  if (existingUser) {
    return res.status(400).json({ error: "This " + exist + " already exists" });
  }

  const newId = String(
    app.db
      .get("users")
      .value()
      .reduce((maxId, user) => Math.max(parseInt(user.id), maxId), 0) + 1
  );

  const newUser = {
    id: newId,
    username,
    password: bcrypt.hashSync(password),
    role,
    fullName,
    email,
  };
  // Save to db.json
  app.db.get("users").push(newUser).write();

  // Generate token
  // const token = jwt.sign(
  //     { id: newUser.id, username: newUser.username, role: newUser.role },
  //     "your-secret-key",
  //     { expiresIn: "1h" }
  // );

  const userInfo = {
    id: newId,
    username,
    email,
    role,
  };

  res.status(201).json({
    message: "Registered Successfully!",
    user: userInfo,
  });
});

app.delete("/warehouses/:id", (req, res) => {
  const { id } = req.params;
  const db = app.db;

  try {
    const warehouseExists = db.get("warehouses").find({ id }).value();
    if (!warehouseExists) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    const relatedInventory = db
      .get("inventory")
      .filter({ warehouseId: id })
      .value();
    if (relatedInventory.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete. Warehouse still has inventory." });
    }

    const relatedUsers = db.get("users").filter({ warehouseId: id }).value();
    if (relatedUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete. Warehouse has assigned staff." });
    }

    const relatedSendingOrders = db
      .get("orders")
      .filter({ sendWarehouseId: id })
      .value();
    const relatedReceivingOrders = db
      .get("orders")
      .filter({ receiveWarehouseId: id })
      .value();
    if (relatedSendingOrders.length > 0 || relatedReceivingOrders.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete. Warehouse is associated with orders." });
    }

    const relatedShipments = db
      .get("shipments")
      .filter({ sendWarehouseId: id })
      .value();
    if (relatedShipments.length > 0) {
      return res.status(400).json({
        error: "Cannot delete. Warehouse is associated with shipments.",
      });
    }
    db.get("warehouses").remove({ id }).write();

    res.status(200).json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    console.error("Error deleting warehouse on server:", error);
    res.status(500).json({
      error: "An internal server error occurred while deleting the warehouse.",
    });
  }
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const db = app.db;

  try {
    // Kiểm tra xem user có tồn tại không
    const userExists = db.get("users").find({ id }).value();
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Kiểm tra ràng buộc
    const relatedSenderOrders = db
      .get("orders")
      .filter({ senderStaffId: id })
      .value();
    const relatedReceiverOrders = db
      .get("orders")
      .filter({ receiverStaffId: id })
      .value();
    if (relatedSenderOrders.length > 0 || relatedReceiverOrders.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete. User is associated with orders." });
    }

    const relatedShipments = db
      .get("shipments")
      .filter({ shipperId: id })
      .value();
    if (relatedShipments.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete. User is associated with shipments." });
    }

    db.get("users").remove({ id }).write();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error while deleting user." });
  }
});

// Process an import order
app.post("/orders/:id/process", (req, res) => {
  const { id } = req.params;
  const { acceptedItems, defectiveItems, staffId, warehouseId } = req.body;
  const db = app.db;

  try {
    // 1. Validate the import order
    const order = db.get("orders").find({ id }).value();
    if (!order) {
      return res.status(404).json({ message: "Import order not found" });
    }

    if (order.status === "completed") {
      return res.status(400).json({ message: "Order already processed" });
    }

    if (order.type !== "import") {
      return res.status(400).json({ message: "Not an import order" });
    }

    // 2. Process accepted items - add to inventory
    for (const item of acceptedItems) {
      // Check if this product already exists in inventory for this warehouse
      const existingInventory = db
        .get("inventory")
        .find({
          productId: item.productId,
          warehouseId,
        })
        .value();

      if (existingInventory) {
        // Update existing inventory
        db.get("inventory")
          .find({
            productId: item.productId,
            warehouseId,
          })
          .assign({
            quantity: existingInventory.quantity + item.quantity,
          })
          .write();
      } else {
        // Create new inventory entry
        const newInventoryId = Date.now().toString();
        db.get("inventory")
          .push({
            id: newInventoryId,
            productId: item.productId,
            warehouseId,
            quantity: item.quantity,
          })
          .write();
      }

      // Update order detail status to accepted
      db.get("orderDetails")
        .find({ id: item.detailId })
        .assign({ status: "accepted" })
        .write();
    }

    // 3. Process defective items
    for (const item of defectiveItems) {
      // Mark order detail as defective/refunded
      db.get("orderDetails")
        .find({ id: item.detailId })
        .assign({ status: "refunded" })
        .write();
    }

    // 4. Update order status to completed
    const completedDate = new Date().toISOString();
    db.get("orders")
      .find({ id })
      .assign({
        status: "completed",
        completedDate,
        receiverStaffId: staffId,
      })
      .write();

    // 5. Create a log entry
    const logId = Date.now().toString();
    db.get("logs")
      .push({
        id: logId,
        userId: staffId,
        action: `Import order #${id} processed. ${acceptedItems.length} items accepted, ${defectiveItems.length} items refunded`,
        timestamp: completedDate,
      })
      .write();

    res.status(200).json({
      message: "Import order processed successfully",
      acceptedCount: acceptedItems.length,
      defectiveCount: defectiveItems.length,
    });
  } catch (error) {
    console.error("Error processing import order:", error);
    res.status(500).json({ message: "Server error processing import order" });
  }
});

app.use(router);
app.listen(9999, () => {
  console.log("Custom JSON Server running on port 9999");
});
