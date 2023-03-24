const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 封装send方法
app.use((req, res, next) => {
    res.cc = (msg, code=500) => {
        res.send({
            code,
            msg: msg instanceof Error? msg.message: msg
        })
    }
    next()
})

const userRouter = require('./router/user')
app.use(userRouter)
const systemRouter = require('./router/system')
app.use(systemRouter)

app.listen(80, () => {
    console.log('listening on http://127.0.0.1');
})