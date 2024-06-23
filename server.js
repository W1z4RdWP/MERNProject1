const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const PORT = process.env.PORT || 3500

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

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

app.listen(PORT, () => console.log(`Server port: ${PORT}`))