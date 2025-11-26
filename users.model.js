import mongoose from 'mongoose'

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    age: {
        type: Number,
        required: true,
        min: [16, 'less than 16 can not register'],
        max: [100, 'please enter a valid age']

    },
    usersname: {
        type: String,
        unique: true,
        required: true,

    },
    password: {
        type: String,
        required: true,
        min: [4, 'Password length should be more than 4 character'],
        max: [200, 'Password length can not be more than 200 character']

    },
    status: {
        type: Boolean,
        required: true,
        default: true

    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin' ],
        default: 'user'

    }

}, { timestamps: true })

export default usersSchema