import mongoose, { Schema } from "mongoose";

export const taskCommentSchema = new Schema(
    {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        message: {
            type: String,
            required: true
        },

        commentedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        attachments: {
            type: [
                {

                    fileName: {
                        type: String,
                        required: true
                    },
                    fileUrl: {
                        type: String,
                        required: true
                    },
                    filePath: {
                        type: String,
                        required: true
                    }

                }
            ]
        }
    },
    { timestamps: true }
);

// export default mongoose.model("TaskComment", taskCommentSchema);
