import mongoose, { createConnection, connect } from 'mongoose'
import usersSchema from './users.model.js'
import refreshTokenSchema from './refreshToken.model.js'
import './paths.utils.js'
import dotenv from 'dotenv'
import { tasksSchema } from './models/tasks.model.js'
import { taskCommentSchema } from './models/taskComment.model.js'
import { taskMemberSchema } from './models/taskMember.model.js'
import { taskAttachmentSchema } from './models/taskAttachment.model.js'

// dotenv.config({
//     path: dotenvPath
// })

export const User = new mongoose.model('User', usersSchema, 'users')
export const RefreshToken = new mongoose.model('RefreshToken', refreshTokenSchema)
export const Task = new mongoose.model('Task', tasksSchema)
export const Member = new mongoose.model('Member', taskMemberSchema)
export const Attachment = new mongoose.model('Attachment', taskAttachmentSchema)
export const Comment = new mongoose.model('Comment', taskCommentSchema)


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