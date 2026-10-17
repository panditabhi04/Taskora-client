import express from "express"
import { createEmployee, deleteEmployee, getAllEmployee, updateEmployee } from "../controller/employee.controller.js"

const router=express.Router()

router.post("/",createEmployee)
router.get("/",getAllEmployee)
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router