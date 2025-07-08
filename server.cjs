const jsonServer = require("json-server");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = jsonServer.create();
const router = jsonServer.router("database.json");

app.db = router.db;

app.use(cors());
app.use(jsonServer.bodyParser);

// Custom login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!password || !username) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    // Try to find by email or username
    const user = app.db
        .get("users")
        .find(u =>
            (username && (u.email === username || u.username === username))
        )
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
        { id: user.id, email: user.email },
        "your-secret-key",
        { expiresIn: "1h" }
    );

    const userInfo = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    }

    res.json({ accessToken: token, user: userInfo});
});

app.post("/register", (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    // Check if email or username already exists
    const existingUser = app.db
        .get("users")
        .find(
            (u) => u.email === email || u.username === username
        )
        .value();

    if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
    }

    // Generate new user ID
    const newId =
        app.db.get("users").value().reduce((maxId, user) => Math.max(user.id, maxId), 0) + 1;

    const newUser = {
        id: newId,
        email,
        username,
        password
    };
    // Save to db.json
    app.db.get("users").push(newUser).write();

    // Generate token
    const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        "your-secret-key",
        { expiresIn: "1h" }
    );

    res.status(201).json({ accessToken: token, user: newUser });
});

app.use(router);
app.listen(9999, () => {
    console.log("Custom JSON Server running on port 9999");
});
