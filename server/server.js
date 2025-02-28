require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/user");
app.use("/users", userRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port} `);
});
