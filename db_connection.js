import mongoose, { createConnection, connect } from 'mongoose'
import usersSchema from './users.model.js'
import refreshTokenSchema from './refreshToken.model.js'
import './paths.utils.js'
import dotenv from 'dotenv'

// dotenv.config({
//     path: dotenvPath
// })

export const User = new mongoose.model('User', usersSchema, 'users')
export const RefreshToken = new mongoose.model('RefreshToken', refreshTokenSchema)

const uri = `${process.env.CONSTR}`
// console.log('connection string: ', uri)

export let con;
export const conHelperFn = async () => {
    return con = await connect(uri)

}

export const checkConnection = (con) => {
    const test = con.connection.readyState
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
    const opt = states[test]
    return `Connection status: ${opt}`

}

export default conHelperFn