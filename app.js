const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config(); 

const app = express();
const port = process.env.PORT
const hostname = process.env.HOST


app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());

app.get('/', (req, res) => {
    return res.status(404).send("WHOMEGALUL");
});

app.get('/watch/videos/:id', (req, res) => {
    return res.json({
        videoId: req.params.id
    });
});

mongoose.connect();


app.listen(port, hostname, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});

