import express, { json, urlencoded } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { __dirname, publicPath, dotenvPath } from './paths.utils.js'
import conHelperFn, { con, User } from './db_connection.js'
import { deleteUserFn, finduserFn, homeUserFn, insertUserFn, loginUserFn, middlewareAuth, updatePasswordFn } from './controller.js'
import cookieParser from 'cookie-parser'

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(publicPath))
app.use(cookieParser())

app.use(cors({
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'credentials': true
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

app.post('/home', middlewareAuth, homeUserFn)
app.post('/login', middlewareAuth, loginUserFn)
app.post('/register', middlewareAuth, insertUserFn)
app.patch('/updatepassword', middlewareAuth, updatePasswordFn)
app.delete('/deleteaccount', middlewareAuth, deleteUserFn)
app.get('/getuser', middlewareAuth, finduserFn)



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







