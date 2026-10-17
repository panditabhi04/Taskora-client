import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const conntedDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        // console.log("Data Base Connted Sucessfuly")
        console.log("MongoDB Atlas connected successfully");
    } catch (error) {
        console.log("Erorr in conntedDb",error)
    }
}
export default conntedDb