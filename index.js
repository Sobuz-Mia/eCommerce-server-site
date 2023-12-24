const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const productCollection = client.db("eCommerceDB").collection("products");
    const usersCollection = client.db("eCommerceDB").collection("users");
    const cartCollection = client.db("eCommerceDB").collection("carts");
    // get all products
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });
    // single product add
    app.get("/product/", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    app.get("/carts/data", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });
    // add to card products
    app.post("/add-product", async (req, res) => {
      const product = req.body;
      const result = await cartCollection.insertOne(product);
      res.send(result);
    });
    app.post("/user", async (req, res) => {
      const userInfo = req.body;
      const query = {email:userInfo.email}
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message:'User already exist'})
      }
      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("eCommerce server site is running");
});

app.listen(port, () => {
  console.log(`eCommerce site is running port ${port}`);
});
