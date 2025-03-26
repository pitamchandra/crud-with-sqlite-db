const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()

const port = 3000;
const app = express()

// middleware
app.use(cors())
app.use(express.json())


// create database

const database = new sqlite3.Database('fashion_store.db', (err) => {
    if(err){
        console.errror('error connecting database: ' , err.message)
    }else{
        console.log("database is connected.");
    }
})

// create a table
database.run(`create table if not exists products (
        id integer primary key autoincrement,
        name text,
        category text,
        description text,
        price integer,
        sizes text,
        stock integer,
        image_url text
    )`)

// get response
app.get('/', (req, res) => {
    res.send(`server is running .....`);
})

// post data
app.post('/products', (req, res) => {
    const {name, category, description, price, sizes, stock, image_url} = req.body;
database.run('insert into products (name, category, description, price, sizes, stock, image_url) values (?, ?, ?, ?, ?, ?, ?)', [name, category, description, price, sizes, stock, image_url], function(err){
        if(err){
            res.status(500).json({
                status: "failed",
                message: err.message
            })
        }else{
            res.status(201).json({
                status: "success",
                data : {id: this.lastID, name, category, description, price, sizes, stock, image_url}
            })
        }
    })
})

// get all data

app.get("/products", (req, res) => {
    database.all('select * from products', [], (err, rows) => {
        if(err){
            res.status(500).json({
                status: "failed",
                message: err.message
            })
        }else {
            res.status(200).json({
                status: "success",
                data: rows
            })
        }
    })
})

// get one data

app.get("/products/:id", (req, res) => {
    const { id } = req.params;
    console.log(id);
    database.get('select * from products where id = ?', [id], (err, row) => {
        if(err){
            res.status(500).json({
                status: "failed",
                message: err.message
            })
        }else if(!row){
            res.status(404).json({
                status: "failed",
                message: "product not found"
            })
        }else{
            res.status(200).json({
                status: "success",
                data : row
            })
        }
    })
})

app.put('/products/:id', (req, res) => {
    const { id } = req.params
    const { name, category, description, price, sizes, stock, image_url } = req.body
    database.run('update products set name = ?, category = ?, description = ?, price = ?, sizes = ?, stock = ?, image_url = ? where id = ?', [name, category, description, price, sizes, stock, image_url, id], function(err) {
        if(err){
            res.status(500).json({
                status: "failed",
                message: err.message
            })
        }else if(this.changes === 0){
            res.status(404).json({
                status: "failed",
                message: "product not found"
            })
        }else{
            res.json({
                status: "success",
                data : {id, name, category, description, price, sizes, stock, image_url}
            })
        }
    })
})

app.delete('/products/:id', (req, res) => {
    const { id } = req.params
    console.log(this);
    database.run('delete from products where id = ?', [id], function(err) {
        if(err){
            res.status(500).json({ 
                status: 'failed',
                message: err.message
            })
        }else if(this.changes === 0){
            res.status(404).json({
                status: "failed",
                message: "product not found"
            })
            console.log(this);
        }else{
            res.status(200).json({
                status: "success",
                message: "product deleted successfully"
            })
            console.log(this);
        }
    })
})

app.listen(port, () => {
    console.log(`the server is running on port ${port}`);
})