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


const uri = "mongodb+srv://<username>:<password>@cluster0.6jo974x.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});


app.get('/', async (req, res) => {
    res.send('reseller project is running');
});

app.listen(port, () => console.log('code is running'));