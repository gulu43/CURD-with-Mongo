import mongoose, { Schema } from "mongoose";

export const taskMemberSchema = new Schema(
    {
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            enum: ["owner", "assignee", "collaborator", "watcher"],
            default: "assignee"
        },

        addedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

// export default mongoose.model("TaskMember", taskMemberSchema);
