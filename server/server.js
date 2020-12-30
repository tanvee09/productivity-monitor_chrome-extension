const express = require('express');
// const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const user = require('./routes/user');
require('dotenv').config();


const app = express();


dbname = "kadt-learn";
//dbname = "kadtApp";
//url = process.env.DATA_BASE + dbname;
url = 'mongodb://localhost:27017/' + dbname;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => {
        console.log("MONGO CONNECTION OPEN");
    })
    .catch(err => {
        console.log("MONGO CONNECTION ERROR");
        console.log(err);
    });


// app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '200mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.use(cors({ origin: "*" }));

app.use('/user', user);



const port = 8000;


app.listen(port, () => {
    console.log(`Server running on ${port}`);
})
