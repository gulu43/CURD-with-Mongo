import express, { json, urlencoded } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { __dirname, publicPath } from './paths.utils.js'
import conHelperFn, { con, User, RefreshToken } from './db_connection.js'
import { deleteUserFn, finduserFn, refreshTokenFn, homeUserFn, insertUserFn, loginUserFn, updatePasswordFn, checkAccessTokenMiddleware, initialRequest, logoutFn, allowedRoles, updateUserFn, finduserPostFn, createTaskFn, getTasksFn, deleteTaskFn, findTaskPostFn, findUserForTaskFn, assignTaskFn, getTasksDetailsFn, downloadAttachmentFn } from './controller.js'
import cookieParser from 'cookie-parser'
import { upload } from './multer_.js'
const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(express.static(publicPath))
app.use('/public', express.static('public'));

app.use(cookieParser())

app.use(cors({
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'credentials': true
}))

// dotenv.config({
//     path: dotenvPath
// })

const PORT = process.env.PORT || 8000

app.get('/', (req, res) => {
    console.log('get request made')

    res
        .status(200)
        .json({
            mesage: 'response from server , connection ok'
        })

})
// app.post('/access', generateAccessTokenFn)
// app.get('/refreshToken', checkAccessTokenMiddleware, initialAccessTokenRequest)
app.get('/me', checkAccessTokenMiddleware, initialRequest)
app.post('/refresh', refreshTokenFn)
app.post('/home', checkAccessTokenMiddleware, homeUserFn)
app.post('/login', loginUserFn)
app.post('/register', insertUserFn)
app.patch('/updatepassword', checkAccessTokenMiddleware, updatePasswordFn)
app.patch('/updateuser', checkAccessTokenMiddleware, allowedRoles('admin'), updateUserFn)
app.post('/logout', checkAccessTokenMiddleware, logoutFn)
app.delete('/deleteaccount', checkAccessTokenMiddleware, allowedRoles('admin'), deleteUserFn)
app.get('/getuser', checkAccessTokenMiddleware, allowedRoles('admin'), finduserFn)
app.post('/getuserpost', checkAccessTokenMiddleware, allowedRoles('admin'), finduserPostFn)
app.post('/createtask', checkAccessTokenMiddleware, allowedRoles('admin'), upload.array('attachments', 10), createTaskFn)
app.get('/gettasks', checkAccessTokenMiddleware, allowedRoles('admin'), getTasksFn)
app.delete('/deletetask', checkAccessTokenMiddleware, allowedRoles('admin'), deleteTaskFn)
app.post('/gettaskspost', checkAccessTokenMiddleware, allowedRoles('admin'), findTaskPostFn)
// app.get('/allusers', checkAccessTokenMiddleware, allowedRoles('admin'), findUserForTaskFn) using old api now finduserFn()
app.post('/assigntask', checkAccessTokenMiddleware, allowedRoles('admin'), assignTaskFn)
app.post('/gettaskdetails', checkAccessTokenMiddleware, allowedRoles('admin'), getTasksDetailsFn)
app.get('/attachments/download/:id', downloadAttachmentFn)

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

