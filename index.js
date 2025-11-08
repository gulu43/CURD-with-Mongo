import express, { json, urlencoded } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { __dirname, publicPath, dotenvPath } from './paths.utils.js'
import conHelperFn, { con, User } from './db_connection.js'
import { insertUserFn, updatePasswordFn } from './controller.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(publicPath))

app.use(cors({
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
}))

dotenv.config({
    path: dotenvPath
})

const PORT = process.env.PORT || 8000

app.get('/', (req, res) => {
    console.log('get request made')

    res
        .status(200)
        .json({
            mesage: 'response from server , connection ok'
        })

})

app.post('/register', insertUserFn)
app.patch('/updatepassword', updatePasswordFn)



app.use((err, req, res, next) => {
    console.error('Caught error:', err)
    res.status(500).json({ err })
})

    ; (async () => {
        await conHelperFn()
        console.log("Db Connected")

        app.listen(PORT, () => {
            console.log('server is listing on: ', PORT)

        })
    })()







