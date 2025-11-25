import mongoose from "mongoose"
import { type } from "os"

const refreshTokenSchema = new mongoose.Schema({

    usersId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    token: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isRevoked: {
        type: Boolean,
        required: true,
        default: false
    }

}, { timestamps: true })

export default refreshTokenSchema