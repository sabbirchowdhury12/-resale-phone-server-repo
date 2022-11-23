const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());


app.get('/', async (req, res) => {
    res.send('reseller project is running');
});

app.listen(port, () => console.log('code is running'));