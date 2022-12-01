const mongoose = require('mongoose');

const password = process.env.ATLAS_PASSWORD

mongoose.connect(`mongodb+srv://admin:${password}@glossa-galore.u23rxwx.mongodb.net/?retryWrites=true&w=majority`, {
  useNewUrlParser: true
});

const db = mongoose.connection;

db.on('connected', function() {
  console.log(`Connected to MongoDB at ${db.host}:${db.port}`);
})

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://admin:<password>@glossa-galore.u23rxwx.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});