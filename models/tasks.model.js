import mongoose, { Schema } from "mongoose"

export const tasksSchema = new mongoose.Schema({

    // not needed for now
    // projectId: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Project",
    //     required: true
    // },

    title: {
        type: String,
        required: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        trim: true,

    },
    description: {
        type: String,
        required: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        trim: true,

    },
    status: {
        type: String,
        enum: [
            'created',
            'in_progress',
            'review',
            'completed',
            'cancelled'
        ],
        default: 'created',
        required: true,
    },
    isAssigned: {
        type: Boolean,
        default: false,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        required: false,
        validate: {
            validator: function (value) {
                return value > new Date()
            },
            message: 'Selected date/time must be greater than the current date/time'
        },

    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    UpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

}, { timestamps: true })
