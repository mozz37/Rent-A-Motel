import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"
import listingRoutes from "./routes/listing.routes.js"
import bookingRoutes from "./routes/booking.routes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cookieParser())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/listing", listingRoutes)
app.use("/api/booking", bookingRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})