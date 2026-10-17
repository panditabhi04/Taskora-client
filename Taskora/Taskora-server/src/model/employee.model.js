import mongoose from "mongoose";

const employeeSchma = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
      required: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    leaveStart: {
      type: Date,
      default: null,
    },

    leaveEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validate leave dates based on employee status
employeeSchma.pre("validate", function () {
  if (this.status === "On Leave") {
    if (!this.leaveStart || !this.leaveEnd) {
      this.invalidate(
        "leaveStart",
        "Leave start and end dates are required when employee is On Leave"
      );
    } else if (this.leaveStart > this.leaveEnd) {
      this.invalidate(
        "leaveEnd",
        "Leave end date must be after or equal to leave start date"
      );
    }
  } else {
    this.leaveStart = null;
    this.leaveEnd = null;
  }
});

export default mongoose.model("Employee", employeeSchma);