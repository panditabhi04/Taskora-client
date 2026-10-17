
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      required: true,
    },

    status: {
      type: String,
      enum: ["Todo", "In Progress", "Completed", "Cancelled"],
      default: "Todo",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    createdDate: {
      type: Date,
      default: Date.now,
    },

    completedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.pre("validate", function () {
  if (!this.taskId) {
    this.taskId = `TASK-${new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase()}`;
  }

  if (this.startDate && this.dueDate && this.startDate > this.dueDate) {
    this.invalidate(
      "dueDate",
      "Due date must be after or equal to start date"
    );
  }

  if (this.status === "Completed") {
    if (!this.completedDate) {
      this.completedDate = new Date();
    }
  } else {
    this.completedDate = null;
  }

  if (this.isNew && this.status !== "Todo") {
    this.invalidate("status", "New tasks must start as Todo");
  }
});

export default mongoose.model("Task", taskSchema);
