import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import conntedDb from "./database/db.js"
import employeeRouter from "./route/index.js"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
const PORT = process.env.PORT || 6000

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Taskora backend is running successfully"
    });
});
app.use("/api", employeeRouter)


app.listen(PORT, () => {
    conntedDb()
    console.log(`http://localhost:${PORT}`)
})