const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.6jo974x.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//verify token
function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unathorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {
    try {

        const Category = client.db('reSellPhone').collection('category');
        const Products = client.db('reSellPhone').collection('products');
        const Users = client.db('reSellPhone').collection('users');
        const Orders = client.db('reSellPhone').collection('orders');
        const Payment = client.db('reSellPhone').collection('payment');

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

        //get user by query
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await Users.findOne(query);
            res.send(result);
        });


        //add product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await Products.insertOne(product);
            res.send(result);
        });

        //get my products by email
        app.get('/products', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = { email: email };
            const result = await Products.find(query).toArray();
            res.send(result);
        });

        //get advertise products
        app.get('/products/:advertise', async (req, res) => {
            const advertise = req.params.advertise;
            const query = { saleStatus: advertise };
            const result = await Products.find(query).toArray();
            res.send(result);
        });

        //make advertise
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    saleStatus: "advertise"
                },
            };
            const result = await Products.updateOne(filter, updateDoc, options);
            res.send(result);
        });


        //delete a product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await Products.deleteOne(query);
            res.send(result);
        });


        //seller route
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await Users.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        });

        // buyer route
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await Users.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' });
        });

        // buyer route
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await Users.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        });


        //add orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await Orders.insertOne(order);
            res.send(result);
        });


        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await Orders.findOne(query);
            res.send(result);
        });
        //get my orders
        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await Orders.find(query).toArray();
            res.send(result);
        });


        //get all buyers
        app.get('/allbuyers/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role: role };
            const result = await Users.find(query).toArray();
            res.send(result);
        });

        //get all sellers
        app.get('/allsellers/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role: role };
            const result = await Users.find(query).toArray();
            res.send(result);
        });

        //delete a users
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await Users.deleteOne(query);
            res.send(result);
        });

        // //update user verify
        // app.put('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id);
        //     // const filter = { _id: ObjectId(id) };
        //     // const options = { upsert: true };
        //     // const updateDoc = {
        //     //     $set: {
        //     //         userStatus: "verified"
        //     //     },
        //     // };
        //     // const result = await Users.updateOne(filter, updateDoc, options);
        //     // res.send(result);
        // });

        //update user verify
        app.put('/users', async (req, res) => {
            const user = req.body;
            const id = user._id;
            const email = user.email;
            console.log(id, email);
            const filter = { _id: ObjectId(id) };
            const filter2 = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    userStatus: "verified"
                },
            };

            const result = await Users.updateOne(filter, updateDoc, options);
            const productUpdated = await Products.updateMany(filter2, updateDoc, options);
            res.send(result);
        });

        //google signin
        app.put('/googleuser', async (req, res) => {
            const user = req.body;
            const email = user.email;
            const name = user.name;
            const role = user.role;

            const filter = {
                name: name,
                email: email,
                role: role
            };
            const findUser = await Users.findOne(filter);
            if (findUser) {
                const options = { upsert: true };
                const updatedDoc = {
                    $set: {
                        name: name,
                        email: email,
                        role: role
                    }
                };
                const updatedResult = await Users.updateOne(filter, updatedDoc, options);
                return res.send(updatedResult);
            }
            const result = await Users.insertOne(user);
            res.send(result);
        });

        //payment
        app.post('/create-payment-intent', async (req, res) => {
            const order = req.body;
            const price = order.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });


        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await Payment.insertOne(payment);
            const productId = payment.productId;
            const filter1 = { _id: ObjectId(productId) };
            const id = payment.orderId;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            };
            const updatedResult = await Orders.updateOne(filter, updatedDoc);
            const updatedResult2 = await Products.updateOne(filter1, updatedDoc);
            res.send(result);
        });


        //jwt
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email
            };
            const user = await Users.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '2 days' });
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' });
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