import mongoose, { Schema } from "mongoose";

export const taskAttachmentSchema = new Schema(
    {
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        fileName: {
            type: String,
            required: true
        },

        fileExt: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }

    },
    { timestamps: true }
);

// export default mongoose.model("TaskAttachment", taskAttachmentSchema);
