import mongoose, { Schema } from "mongoose"

export const tasksSchema = new mongoose.Schema({

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
        default: 'medium',
        required: true
    },
    dueDate: {
        type: Date,
        required: false,
        validate: {
            validator: function (value) {

                const selected = new Date(value);
                selected.setHours(0, 0, 0, 0);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                return selected >= today;
            },
            message: 'Selected date/time must be greater than the current date/time'
        },

    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    isDeleted: {
        type: Boolean,
        required: false,
        default: false
    },

}, { timestamps: true })
