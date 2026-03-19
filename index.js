const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const port = 3000;
const path = require('path');
const router = require('./Route/myRouter');
const dns = require('dns');

dns.setServers(["1.1.1.1", "8.8.8.8"]);
app.use(express.urlencoded({extended:false}));

app.use(express.json());
app.use('/Products/images',express.static(path.join(__dirname,'Products/images')));

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    Credentials: true
}))
mongoose.connect('mongodb+srv://nishikanta394:nishi394@cluster0.krwzypv.mongodb.net/OMP')
.then(()=>{
    console.log('Connected to MongoDB');
}).catch(err=>{
    console.log(err);
})
// app.use('/api',router);

app.use('/api',router);
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})