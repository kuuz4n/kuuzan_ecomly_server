const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const authJwt = require('./middlewares/jwt');
const errorHandler = require('./middlewares/error_handler');

const app = express();
const port = process.env.PORT
const hostname = process.env.HOST
const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING;
const API = process.env.API_URL;

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(authJwt());
app.use(errorHandler);

const authRoutes = require('./routes/auth');

app.use(`${API}/`, authRoutes);
app.get(`${API}/users`, (req, res) => {
    return res.json({name: 'Kevin Ecomly', org: 'xdd', age: 30});
});


mongoose.connect(mongodbConnectionString).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});


app.listen(port, hostname, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});

