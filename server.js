require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const {logEvents} = require('./middleware/logger')
const PORT = process.env.PORT || 3500


console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'))

app.all('*', (req, resp) => {
    resp.status(404)
    if(req.accepts('html')){
        resp.sendFile(path.join(__dirname, 'views', '404.html'))
    }else if(req.accepts('json')){
        resp.json({message: "404 Страница не найдена"})
    }else{
        resp.type('txt').send('404 Страница не найдена')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => console.log(`Server port: ${PORT}`))
})

mongoose.connection.on('error', err  => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})