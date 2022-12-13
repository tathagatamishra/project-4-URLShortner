const express  = require('express' )
const mongoose = require('mongoose')

const router = require("./route/route")

const app = express()

app.use(express.json())


mongoose
.set     ('strictQuery', true)
.connect ("mongodb+srv://new_user:jk1BBWwmxQpZ31zO@cluster0.pxvwsjp.mongodb.net/Project4")
.then    (() => console.log("MDB is connected"))
.catch   (err => console.log(err))


app.use('/', router)

app.listen(3000, () => console.log("server is 🏃 🏃 🏃"))