const express = require("express");
const path = require('path')
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");


dotenv.config({path:'./.env'});

const app= express();
const db = mysql.createConnection({
    host:     process.env.DATABASE_HOST,
    user:     process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// using the public directory
const pubDir = path.join(__dirname, './public');
app.use(express.static(pubDir))

app.use(express.urlencoded({
    extended: false
}))
app.use(express.json());
app.use(cookieParser());


app.set('view engine', 'hbs');

db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("MySQL Connected.....");
    }
})

//define routers
app.use('/', require('./routers/pages'))
app.use('/auth', require('./routers/auth'))

app.listen(3001, ()=>{
    console.log("server started on port 3001")
})