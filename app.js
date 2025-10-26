const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
const authJwt = require("./middlewares/jwt");
const authorizePostRequest = require("./middlewares/authorization");
const errorHandler = require("./middlewares/error_handler");

const app = express();
const port = process.env.PORT;
const hostname = process.env.HOST;
const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING;
const API = process.env.API_URL;
require("./helpers/cron_job");

app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(cors());
app.use(authJwt());
app.use(authorizePostRequest);
app.use(errorHandler);

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const categoriesRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");

app.use(`${API}/`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/categories`, categoriesRoutes);
app.use(`${API}/products`, productRoutes);
app.use("/public", express.static(__dirname + "/public"));

mongoose
  .connect(mongodbConnectionString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});
