const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();
const port = 8000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxxep.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;

const app = express()

app.use(cors())
app.use(bodyParser.json())




var serviceAccount = require("./configs/burj-al-arab-new-d8bff-firebase-adminsdk-a6v0t-30903e7d27.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology:true });
client.connect(err => {
  const bookings = client.db("burj-al-arab").collection("bookings");

    app.post('/addBooking', (req,res) =>{
        const newBooking = req.body;
        bookings.insertOne(newBooking)
        .then(result=>{
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/readBookings', (req,res) =>{
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email;

                if (tokenEmail == queryEmail) {
                    bookings.find({email : queryEmail})
                    .toArray((err,documents) =>{
                        res.send(documents);
                     })
                }
            }).catch(function(error) {
                res.status(401).send("Un-authorized access")
            });
        }
        
        else{
            res.status(401).send("Un-authorized access")
        }

    
    })

});


app.listen(port)