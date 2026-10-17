import { z } from "zod";

export const createEmployeeSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(10, "Phone number is required"),
  department: z.string().trim().min(1, "Department is required"),
  role: z.string().trim().min(1, "Role is required"),
  joiningDate: z.coerce.date(),
  status: z.enum(["Active", "Inactive", "On Leave"]),
  skills: z.array(z.string().trim()).default([]),
  leaveStart: z.string().optional().or(z.literal("")),
  leaveEnd: z.string().optional().or(z.literal("")),
});
