const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.6jo974x.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const Category = client.db('reSellPhone').collection('category');
        const Products = client.db('reSellPhone').collection('products');
        const Users = client.db('reSellPhone').collection('users');

        //get all category from db
        app.get('/category', async (req, res) => {
            const result = await Category.find({}).toArray();
            res.send(result);
        });

        //get product by category id
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: id };
            const result = await Products.find(query).toArray();
            res.send(result);
        });


        //save user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await Users.insertOne(user);
            res.send(result);
        });


        //add product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await Products.insertOne(product);
            res.send(result);
        });

        //get my products by email
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await Products.find(query).toArray();
            res.send(result);
        });

        //delete a product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await Products.deleteOne(query);
            res.send(result);
        });


    }
    finally {

    }
}

run().catch(err => console.log(err));

app.get('/', async (req, res) => {
    res.send('reseller project is running');
});

app.listen(port, () => console.log('code is running'));