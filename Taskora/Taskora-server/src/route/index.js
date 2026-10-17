import express from "express"
import employeeRouter from "../route/employee.route.js"
import taskRouter from "../route/task.routes.js"
import { getDashboard } from "../controller/task.controller.js"

const router=express.Router()

router.use("/employee",employeeRouter)
router.use("/employees",employeeRouter)
router.use("/task",taskRouter)
router.use("/tasks",taskRouter)
router.get("/dashboard", getDashboard)

export default router